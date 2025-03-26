import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import { RazorpayConfig } from './razorpay.config';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { log } from 'util';

let partial_payment = false;

@Injectable()
export class RazorpayService {
  private razorpay: Razorpay;

  constructor() {
    this.razorpay = new Razorpay({
      key_id: RazorpayConfig.key_id,
      key_secret: RazorpayConfig.key_secret,
    });
  }

  async createOrder(amount: number, currency: string, receipt: string) {
    console.log(amount, currency, receipt);
    return this.razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      partial_payment,
    });
  }

  verifyPaymentSignature(
    orderId: string,
    paymentId: string,
    signature: string,
  ): boolean {
    const body = orderId + '|' + paymentId;
    return validateWebhookSignature(body, signature, RazorpayConfig.key_secret);
  }
}
