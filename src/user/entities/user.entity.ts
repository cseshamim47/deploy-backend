import { Bike } from '../../bike/entities/bike.entity';
import { Booking } from '../../booking/entities/booking.entity';

export class User {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  role: string;
  password: string;
  bikes: Bike[];
  bookings: Booking[];
  createdAt: Date;
  updatedAt: Date;
}
