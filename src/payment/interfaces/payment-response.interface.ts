export interface PaymentResponse {
  id: number;
  order_id: string;
  amount: number | string;
  currency: string;
  receipt: string;
  status: string;
  razorpay_key: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
}
