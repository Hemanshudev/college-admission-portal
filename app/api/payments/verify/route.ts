import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { razorpayService } from '@/lib/razorpay';
import { pdfGenerator } from '@/lib/pdf-generator';
import { sendEmail, generatePaymentSuccessEmail } from '@/lib/email';
import { createAuditLog, getClientInfo } from '@/lib/audit';

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT']);
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = 
      verifyPaymentSchema.parse(body);

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        razorpayOrderId: razorpay_order_id,
        userId: user.id,
      },
      include: {
        application: {
          include: {
            course: true,
            studentProfile: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Verify signature
    const isValidSignature = razorpayService.verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      // Update payment as failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failedAt: new Date(),
          razorpayResponse: { error: 'Invalid signature' },
        },
      });

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Update payment as successful
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        completedAt: new Date(),
        paymentMethod: 'Razorpay',
        razorpayResponse: {
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          signature: razorpay_signature,
        },
      },
    });

    // Update application payment status
    await prisma.application.update({
      where: { id: payment.applicationId },
      data: {
        paymentStatus: 'SUCCESS',
      },
    });

    // Generate receipt PDF
    const receiptData = {
      receiptNumber: payment.receiptNumber!,
      transactionId: payment.transactionId,
      studentName: payment.application.studentProfile.firstName + ' ' + 
                   payment.application.studentProfile.lastName,
      courseName: payment.application.course.name,
      amount: payment.amount,
      paymentDate: updatedPayment.completedAt!,
      paymentMethod: 'Razorpay',
      applicationNumber: payment.application.applicationNumber,
    };

    const receiptPdf = pdfGenerator.generateReceipt(receiptData);

    // Send confirmation email
    const emailData = generatePaymentSuccessEmail({
      studentName: receiptData.studentName,
      amount: payment.amount,
      transactionId: payment.transactionId,
      receiptUrl: `${process.env.APP_URL}/api/payments/receipt/${payment.id}`,
    });

    await sendEmail({
      to: user.email,
      ...emailData,
      attachments: [{
        filename: `receipt_${payment.receiptNumber}.pdf`,
        content: receiptPdf.split(',')[1], // Remove data:application/pdf;base64, prefix
        encoding: 'base64',
      }],
    });

    // Create audit log
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: user.id,
      action: 'PAYMENT_VERIFIED',
      entity: 'Payment',
      entityId: payment.id,
      newValues: { 
        status: 'SUCCESS', 
        razorpayPaymentId: razorpay_payment_id,
        amount: payment.amount,
      },
      ...clientInfo,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: payment.id,
      receiptNumber: payment.receiptNumber,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}