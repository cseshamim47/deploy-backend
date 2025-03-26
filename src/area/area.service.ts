import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
  constructor(private prisma: PrismaService) {}

  async create(createAreaDto: CreateAreaDto) {
    // Check if city exists
    const city = await this.prisma.city.findUnique({
      where: { id: createAreaDto.city_id },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${createAreaDto.city_id} not found`);
    }

    // Check if area already exists in this city
    const existingArea = await this.prisma.area.findFirst({
      where: {
        name: createAreaDto.name,
        city_id: createAreaDto.city_id,
      },
    });

    if (existingArea) {
      throw new ConflictException(
        `Area "${createAreaDto.name}" already exists in this city`,
      );
    }

    return this.prisma.area.create({
      data: createAreaDto,
      include: {
        city: true,
      },
    });
  }

  async findAll() {
    return this.prisma.area.findMany({
      include: {
        city: true,
      },
    });
  }

  async findOne(id: number) {
    const area = await this.prisma.area.findUnique({
      where: { id },
      include: {
        city: true,
      },
    });

    if (!area) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }

    return area;
  }

  async findByCityId(cityId: number) {
    const areas = await this.prisma.area.findMany({
      where: { city_id: cityId },
      include: {
        city: true,
      },
    });

    if (!areas.length) {
      throw new NotFoundException(`No areas found for city ID ${cityId}`);
    }

    return areas;
  }

  async findByCityName(cityName: string) {
    const areas = await this.prisma.area.findMany({
      where: {
        city: {
          name: {
            equals: cityName,
            contains: cityName,
          }
        }
      },
      include: {
        city: true,
      },
      orderBy: {
        name: 'asc'
      }
    });

    if (!areas.length) {
      throw new NotFoundException(`No areas found for city "${cityName}"`);
    }

    return areas;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    try {
      // If updating city_id, check if new city exists
      if (updateAreaDto.city_id) {
        const city = await this.prisma.city.findUnique({
          where: { id: updateAreaDto.city_id },
        });

        if (!city) {
          throw new NotFoundException(
            `City with ID ${updateAreaDto.city_id} not found`,
          );
        }
      }

      // Check for duplicate area name in the same city
      if (updateAreaDto.name) {
        const area = await this.prisma.area.findUnique({
          where: { id },
        });

        const existingArea = await this.prisma.area.findFirst({
          where: {
            name: updateAreaDto.name,
            city_id: updateAreaDto.city_id || area.city_id,
            id: { not: id }, // Exclude current area
          },
        });

        if (existingArea) {
          throw new ConflictException(
            `Area "${updateAreaDto.name}" already exists in this city`,
          );
        }
      }

      return await this.prisma.area.update({
        where: { id },
        data: updateAreaDto,
        include: {
          city: true,
        },
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.area.delete({
        where: { id },
        include: {
          city: true,
        },
      });
    } catch (error) {
      throw new NotFoundException(`Area with ID ${id} not found`);
    }
  }
}
