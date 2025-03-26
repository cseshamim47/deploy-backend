export enum OfferStatus {
  active = 'active',
  inactive = 'inactive',
  expired = 'expired',
}

export class Offer {
  id: number;
  title: string;
  description: string;
  amount: number;
  above_amount: number;
  image: string;
  coupon: string;
  status: OfferStatus;
  start_date: Date;
  end_date: Date;
  createdAt: Date;
  updatedAt: Date;
}
