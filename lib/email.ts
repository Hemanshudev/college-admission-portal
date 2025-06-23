import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string;
    encoding: string;
  }>;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
      ...options,
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error };
  }
}

export function generatePaymentSuccessEmail(data: {
  studentName: string;
  amount: number;
  transactionId: string;
  receiptUrl: string;
}) {
  return {
    subject: 'Payment Confirmation - SPPU Admission Portal',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center;">
          <h1>Payment Successful!</h1>
        </div>
        
        <div style="padding: 20px; background: #f9fafb;">
          <p>Dear ${data.studentName},</p>
          
          <p>Your payment has been successfully processed. Here are the details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Amount Paid:</strong> ₹${data.amount}</p>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <p>Your payment receipt is attached to this email. Please keep it for your records.</p>
          
          <p>You can now proceed with the next steps of your admission process.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/student/dashboard" 
               style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Continue Application
            </a>
          </div>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p>Best regards,<br>SPPU Admission Team</p>
        </div>
        
        <div style="background: #374151; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>© 2024 Savitribai Phule Pune University. All rights reserved.</p>
        </div>
      </div>
    `,
  };
}