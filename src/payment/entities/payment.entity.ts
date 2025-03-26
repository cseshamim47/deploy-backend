import { Booking } from '../../booking/entities/booking.entity';

export class Payment {
  id: number;
  booking_id: number;
  booking: Booking;
  trx_id: string;
  method: string;
  createdAt: Date;
  updatedAt: Date;
}
