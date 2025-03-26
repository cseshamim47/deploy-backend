import { Booking } from '../../booking/entities/booking.entity';

export class Bike {
  id: number;
  name: string;
  image: string;
  type: string;
  seat: number;
  oil: string;
  city: string;
  area: string;
  day_price: number;
  seven_day_price: number;
  fifteen_day_price: number;
  month_price: number;
  limit: number;
  extra: number;
  fuel: string;
  deposit: number;
  make_year: number;
  bookings: Booking[];
  serial: string;
  createdAt: Date;
  updatedAt: Date;
}
