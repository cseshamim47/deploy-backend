import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OfferStatus } from './entities/offer.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class OfferService {
  constructor(private prisma: PrismaService) {}

  async create(createOfferDto: CreateOfferDto) {
    
    // Validate dates
    console.log(createOfferDto);
    
    if (createOfferDto.end_date <= createOfferDto.start_date) {
      throw new BadRequestException('End date must be after start date');
    }

    return this.prisma.offer.create({
      data: createOfferDto,
    });
  }

  findAll() {
    return this.prisma.offer.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.offer.findUnique({
      where: { id },
    });
  }

  findByCoupon(coupon: string) {
    const now = new Date();
    return this.prisma.offer.findFirst({
      where: {
        coupon,
        status: OfferStatus.active,
        start_date: {
          lte: now,
        },
        end_date: {
          gte: now,
        },
      },
    });
  }

  findValidOffers(amount: number) {
    const now = new Date();
    return this.prisma.offer.findMany({
      where: {
        above_amount: {
          lte: amount,
        },
        status: OfferStatus.active,
        start_date: {
          lte: now,
        },
        end_date: {
          gte: now,
        },
      },
      orderBy: {
        amount: 'desc',
      },
    });
  }

  async update(id: number, updateOfferDto: UpdateOfferDto) {
    // If updating dates, validate them
    if (updateOfferDto.start_date && updateOfferDto.end_date) {
      if (updateOfferDto.end_date <= updateOfferDto.start_date) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return this.prisma.offer.update({
      where: { id },
      data: updateOfferDto,
    });
  }

  async remove(id: number) {
    // Get the offer to delete its image
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    // Delete the image file if it exists
    if (offer?.image) {
      const imagePath = offer.image.split('/').pop();
      if (imagePath) {
        const fullPath = path.join(process.cwd(), 'public', 'offers', imagePath);
        try {
          fs.unlinkSync(fullPath);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }

    return this.prisma.offer.delete({
      where: { id },
    });
  }

  async removeAll() {
    // Get all offers to delete their images
    const offers = await this.prisma.offer.findMany();

    // Delete all image files
    const offerDir = path.join(process.cwd(), 'public', 'offer');
    try {
      // Delete all files in the offer directory
      const files = fs.readdirSync(offerDir);
      for (const file of files) {
        fs.unlinkSync(path.join(offerDir, file));
      }
    } catch (error) {
      console.error('Error deleting image directory:', error);
    }

    // Delete all offers from database
    return this.prisma.offer.deleteMany();
  }

  // Utility method to check offer validity
  async checkOfferValidity(id: number) {
    const now = new Date();
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      return false;
    }

    // Check if offer is expired
    if (now > offer.end_date && offer.status === OfferStatus.active) {
      await this.prisma.offer.update({
        where: { id },
        data: { status: OfferStatus.expired },
      });
      return false;
    }

    return (
      offer.status === OfferStatus.active &&
      now >= offer.start_date &&
      now <= offer.end_date
    );
  }
}
