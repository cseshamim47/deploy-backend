import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Status } from '../booking/entities/booking.entity';
import { SearchBikeDto } from './dto/search-bike.dto';
import { TimeSearchBikeDto } from './dto/time-search.dto';

@Injectable()
export class BikeService {
  constructor(private prisma: PrismaService) {}

  create(createBikeDto: CreateBikeDto) {
    return this.prisma.bike.create({
      data: {
        name: createBikeDto.name,
        image: createBikeDto.image,
        type: createBikeDto.type,
        city: createBikeDto.city,
        area: createBikeDto.area,
        day_price: createBikeDto.day_price,
        seven_day_price: createBikeDto.seven_day_price,
        fifteen_day_price: createBikeDto.fifteen_day_price,
        month_price: createBikeDto.month_price,
        limit: createBikeDto.limit,
        extra: createBikeDto.extra,
        deposit: createBikeDto.deposit,
        make_year: createBikeDto.make_year,
        serial: createBikeDto.serial,
      },
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.bike.findMany({
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  findOne(id: number) {
    return this.prisma.bike.findUnique({
      where: { id },
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  async findByCity(
    city: string,
    name?: string,
    start_time?: Date,
    end_time?: Date,
  ) {
    const whereClause: any = {
      city: city,
    };

    // Add name filter if provided (exact match)
    if (name) {
      whereClause.name = name;
    }

    // If both dates are provided, add booking availability check
    if (start_time && end_time) {
      whereClause.bookings = {
        none: {
          AND: [
            { status: Status.active },
            {
              OR: [
                {
                  AND: [
                    { start_time: { lte: end_time } },
                    { end_time: { gte: start_time } },
                  ],
                },
              ],
            },
          ],
        },
      };
    }

    return this.prisma.bike.findMany({
      where: whereClause,
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  async findByCityAndName(
    city: string,
    name: string,
    start_time?: Date,
    end_time?: Date,
  ) {
    const whereClause: any = {
      city: {
        contains: city,
      },
      name: {
        contains: name,
      },
    };

    // If both dates are provided, add booking availability check
    if (start_time && end_time) {
      whereClause.bookings = {
        none: {
          AND: [
            { status: Status.active },
            {
              OR: [
                {
                  AND: [
                    { start_time: { lte: end_time } },
                    { end_time: { gte: start_time } },
                  ],
                },
              ],
            },
          ],
        },
      };
    }

    return this.prisma.bike.findMany({
      where: whereClause,
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  update(id: number, updateBikeDto: UpdateBikeDto) {
    // Extract only the bike fields, excluding relationships
    const {
      name,
      image,
      type,
      city,
      area,
      day_price,
      seven_day_price,
      fifteen_day_price,
      month_price,
      limit,
      extra,
      deposit,
      make_year,
      serial,
    } = updateBikeDto;

    return this.prisma.bike.update({
      where: { id },
      data: {
        name,
        image,
        type,
        city,
        area,
        day_price,
        seven_day_price,
        fifteen_day_price,
        month_price,
        limit,
        extra,
        deposit,
        make_year,
        serial,
      },
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  remove(id: number) {
    return this.prisma.bike.delete({
      where: { id },
      include: {
        bookings: {
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  async searchAvailableBikes(searchBikeDto: SearchBikeDto) {
    console.log(searchBikeDto);
    
    const { city, pickup_date, dropoff_date } = searchBikeDto;
    const currentDate = new Date();

    console.log(currentDate);
    console.log(pickup_date);
    
    

    // Validate dates
    if (pickup_date >= dropoff_date) {
      throw new BadRequestException('Pickup date must be before dropoff date');
    }

    if (pickup_date < currentDate) {
      throw new BadRequestException('Pickup date must be greater than or equal to current time');
    }

    // Search for bikes in the specified city that are either:
    // 1. Have no bookings
    // 2. Have bookings but no date conflicts
    return this.prisma.bike.findMany({
      where: {
        city: city,
        OR: [
          // Case 1: Bikes with no bookings
          {
            bookings: {
              none: {},
            },
          },
          // Case 2: Bikes with non-conflicting bookings
          {
            bookings: {
              none: {
                AND: [
                  { status: Status.active },
                  {
                    OR: [
                      {
                        // New booking starts during an existing booking
                        start_time: {
                          lt: dropoff_date,
                        },
                        end_time: {
                          gt: pickup_date,
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        bookings: {
          where: {
            status: Status.active,
          },
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  async searchByTimeSlots(timeSearchDto: TimeSearchBikeDto) {
    const { city, pickup_time } = timeSearchDto;

    // Calculate end times for 1 hour and 2 hours ahead
    const oneHourAhead = new Date(pickup_time);
    oneHourAhead.setHours(oneHourAhead.getHours() + 1);

    const twoHoursAhead = new Date(pickup_time);
    twoHoursAhead.setHours(twoHoursAhead.getHours() + 2);

    // Get bikes available for 1 hour
    const oneHourBikes = await this.prisma.bike.findMany({
      where: {
        city: city,
        OR: [
          // Case 1: Bikes with no bookings
          {
            bookings: {
              none: {},
            },
          },
          // Case 2: Bikes with non-conflicting bookings
          {
            bookings: {
              none: {
                AND: [
                  { status: Status.active },
                  {
                    OR: [
                      {
                        start_time: {
                          lt: oneHourAhead,
                        },
                        end_time: {
                          gt: pickup_time,
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        bookings: {
          where: {
            status: Status.active,
          },
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });

    // Get bikes available for 2 hours
    const twoHourBikes = await this.prisma.bike.findMany({
      where: {
        city: city,
        OR: [
          // Case 1: Bikes with no bookings
          {
            bookings: {
              none: {},
            },
          },
          // Case 2: Bikes with non-conflicting bookings
          {
            bookings: {
              none: {
                AND: [
                  { status: Status.active },
                  {
                    OR: [
                      {
                        start_time: {
                          lt: twoHoursAhead,
                        },
                        end_time: {
                          gt: pickup_time,
                        },
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
      },
      include: {
        bookings: {
          where: {
            status: Status.active,
          },
          include: {
            user: true,
            payment: true,
          },
        },
      },
    });

    // Filter out bikes that are available for longer periods
    const oneHourOnly = oneHourBikes.filter(
      (bike) => !twoHourBikes.some((b) => b.id === bike.id),
    );

    return {
      one_hour: oneHourOnly,
      two_hours: twoHourBikes,
    };
  }
}
