import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/database';
import { requireAuth } from '@/lib/auth';
import { razorpayService } from '@/lib/razorpay';
import { createAuditLog, getClientInfo } from '@/lib/audit';

const createOrderSchema = z.object({
  applicationId: z.string(),
  amount: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request, ['STUDENT']);
    const body = await request.json();
    const { applicationId, amount } = createOrderSchema.parse(body);

    // Verify application belongs to user
    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: user.id,
      },
      include: {
        course: true,
        admissionPeriod: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if payment already exists and is successful
    const existingPayment = await prisma.payment.findFirst({
      where: {
        applicationId,
        status: 'SUCCESS',
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already completed for this application' },
        { status: 400 }
      );
    }

    // Generate unique receipt number
    const receiptNumber = `SPPU_${Date.now()}_${application.applicationNumber}`;

    // Create Razorpay order
    const razorpayOrder = await razorpayService.createOrder({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: receiptNumber,
      notes: {
        applicationId: application.id,
        userId: user.id,
        courseName: application.course.name,
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        transactionId: `TXN_${Date.now()}_${user.id}`,
        razorpayOrderId: razorpayOrder.id,
        userId: user.id,
        applicationId: application.id,
        amount,
        currency: 'INR',
        status: 'PENDING',
        receiptNumber,
      },
    });

    // Create audit log
    const clientInfo = getClientInfo(request);
    await createAuditLog({
      userId: user.id,
      action: 'PAYMENT_ORDER_CREATED',
      entity: 'Payment',
      entityId: payment.id,
      newValues: { amount, applicationId, razorpayOrderId: razorpayOrder.id },
      ...clientInfo,
    });

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      receipt: razorpayOrder.receipt,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}