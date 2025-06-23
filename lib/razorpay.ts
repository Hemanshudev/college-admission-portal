import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export interface RazorpayOrderData {
  amount: number; // in paise
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export class RazorpayService {
  private baseUrl = 'https://api.razorpay.com/v1';
  private auth: string;

  constructor() {
    this.auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
  }

  async createOrder(orderData: RazorpayOrderData): Promise<RazorpayOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Razorpay API Error: ${error.error?.description || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Razorpay create order error:', error);
      throw error;
    }
  }

  async fetchOrder(orderId: string): Promise<RazorpayOrder> {
    try {
      const response = await fetch(`${this.baseUrl}/orders/${orderId}`, {
        headers: {
          'Authorization': `Basic ${this.auth}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Razorpay API Error: ${error.error?.description || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Razorpay fetch order error:', error);
      throw error;
    }
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): boolean {
    try {
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  }

  async refundPayment(paymentId: string, amount?: number): Promise<any> {
    try {
      const refundData: any = {};
      if (amount) refundData.amount = amount;

      const response = await fetch(`${this.baseUrl}/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Razorpay API Error: ${error.error?.description || 'Unknown error'}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Razorpay refund error:', error);
      throw error;
    }
  }
}

export const razorpayService = new RazorpayService();