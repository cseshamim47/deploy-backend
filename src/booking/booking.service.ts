import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from './entities/booking.entity';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  create(createBookingDto: CreateBookingDto) {
    return this.prisma.booking.create({
      data: {
        bike: {
          connect: { id: createBookingDto.bike_id },
        },
        user: {
          connect: { id: createBookingDto.user_id },
        },
        start_time: createBookingDto.start_time,
        end_time: createBookingDto.end_time,
        status: createBookingDto.status,
        amount: createBookingDto.amount,
        coupon_id: createBookingDto.coupon_id,
      },
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  findAll() {
    return this.prisma.booking.findMany({
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  findByUser(userId: number) {
    return this.prisma.booking.findMany({
      where: { user_id: userId },
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  findByBike(bikeId: number) {
    return this.prisma.booking.findMany({
      where: { bike_id: bikeId },
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  update(id: number, updateBookingDto: UpdateBookingDto) {
    const data: any = { ...updateBookingDto };

    // If bike_id is provided, set up the connect relation
    if (updateBookingDto.bike_id) {
      data.bike = {
        connect: { id: updateBookingDto.bike_id },
      };
      delete data.bike_id;
    }

    // If user_id is provided, set up the connect relation
    if (updateBookingDto.user_id) {
      data.user = {
        connect: { id: updateBookingDto.user_id },
      };
      delete data.user_id;
    }

    return this.prisma.booking.update({
      where: { id },
      data,
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  remove(id: number) {
    return this.prisma.booking.delete({
      where: { id },
      include: {
        bike: true,
        user: true,
        payment: true,
      },
    });
  }

  findConfirmedBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: Status.active,
      },
      include: {
        bike: true,
        user: true,
      },
    });
  }

  findPendingBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: Status.pending,
      },
      include: {
        bike: true,
        user: true,
      },
    });
  }

  findCancelledBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: Status.cancelled,
      },
      include: {
        bike: true,
        user: true,
      },
    });
  }

  findActiveBookings() {
    return this.prisma.booking.findMany({
      where: {
        status: Status.active,
      },
      include: {
        bike: true,
        user: true,
      },
    });
  }
}
