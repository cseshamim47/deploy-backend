import { Injectable, BadRequestException } from '@nestjs/common';
import {
  CreatePaymentDto,
  RazorpayVerificationDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PrismaService } from '../prisma/prisma.service';
import { RazorpayService } from './razorpay.service';
import { RazorpayConfig } from './razorpay.config';
import { PaymentResponse } from './interfaces/payment-response.interface';

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private razorpayService: RazorpayService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<PaymentResponse> {
    console.log('Incoming Payment Request:', createPaymentDto);

    try {
      // Create Razorpay order
      const order = await this.razorpayService.createOrder(
        createPaymentDto.amount,
        createPaymentDto.currency,
        `booking_${createPaymentDto.booking_id}`,
      );
      console.log('Razorpay Order Created:', order);

      // Create payment record in the database
      const payment = await this.prisma.payment.create({
        data: {
          booking_id: createPaymentDto.booking_id,
          trx_id: order.id,
          method: createPaymentDto.method,
        },
        include: {
          booking: {
            include: {
              user: true,
              bike: true,
            },
          },
        },
      });
      console.log('Payment Record Created:', payment);

      // Return response
      return {
        id: payment.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        status: 'created',
        razorpay_key: RazorpayConfig.key_id,
        prefill: {
          name: payment.booking.user.name,
          email: payment.booking.user.email,
          contact: payment.booking.user.phone,
        },
      };
    } catch (error) {
      console.error('Error Creating Payment:', error.message, error.stack);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPayment(verifyDto: RazorpayVerificationDto) {
    try {
      const isValid = this.razorpayService.verifyPaymentSignature(
        verifyDto.razorpay_order_id,
        verifyDto.razorpay_payment_id,
        verifyDto.razorpay_signature,
      );

      if (!isValid) {
        throw new BadRequestException('Invalid payment signature');
      }

      // Find payment by order ID (stored as trx_id)
      const payment = await this.prisma.payment.findFirst({
        where: { trx_id: verifyDto.razorpay_order_id },
      });

      if (!payment) {
        throw new BadRequestException('Payment not found');
      }

      // Update payment status and store payment ID
      const updatedPayment = await this.prisma.payment.update({
        where: { id: payment.id },
        data: {
          method: 'razorpay_completed',
          trx_id: verifyDto.razorpay_payment_id, // Update with actual payment ID
        },
        include: {
          booking: {
            include: {
              user: true,
              bike: true,
            },
          },
        },
      });

      // Update booking status to active
      await this.prisma.booking.update({
        where: { id: payment.booking_id },
        data: {
          status: 'active',
        },
      });

      return updatedPayment;
    } catch (error) {
      throw new BadRequestException('Payment verification failed');
    }
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        booking: {
          include: {
            user: true,
            bike: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            bike: true,
          },
        },
      },
    });
  }

  findByBookingId(bookingId: number) {
    return this.prisma.payment.findFirst({
      where: { booking_id: bookingId },
      include: {
        booking: {
          include: {
            user: true,
            bike: true,
          },
        },
      },
    });
  }

  update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.prisma.payment.update({
      where: { id },
      data: updatePaymentDto,
      include: {
        booking: {
          include: {
            user: true,
            bike: true,
          },
        },
      },
    });
  }

  remove(id: number) {
    return this.prisma.payment.delete({
      where: { id },
      include: {
        booking: {
          include: {
            user: true,
            bike: true,
          },
        },
      },
    });
  }
}
