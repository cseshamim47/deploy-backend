import { User } from '../../user/entities/user.entity';
import { Bike } from '../../bike/entities/bike.entity';
import { Payment } from '../../payment/entities/payment.entity';

export enum Status {
  pending = 'pending',
  active = 'active',
  completed = 'completed',
  cancelled = 'cancelled',
}

export class Booking {
  id: number;
  bike_id: number;
  bike: Bike;
  user_id: number;
  user: User;
  payment?: Payment;
  start_time: Date;
  end_time: Date;
  status: Status;
  amount: number;
  coupon_id?: number;
  createdAt: Date;
  updatedAt: Date;
}
