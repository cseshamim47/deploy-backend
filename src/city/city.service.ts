import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class CityService {
  constructor(private prisma: PrismaService) {}

  private async cleanupUnusedImages() {
    // Get all city images from database
    const cities = await this.prisma.city.findMany({
      select: { image: true },
    });
    const usedImages = new Set(cities.map(city => city.image));

    // Read all files from the city images directory
    const imageDir = path.join('public', 'city');
    if (!fs.existsSync(imageDir)) return;

    const files = fs.readdirSync(imageDir);

    // Delete files that aren't linked to any city
    for (const file of files) {
      const imagePath = `city/${file}`;
      if (!usedImages.has(imagePath)) {
        try {
          fs.unlinkSync(path.join('public', imagePath));
          console.log(`Deleted unused image: ${imagePath}`);
        } catch (error) {
          console.error(`Failed to delete unused image: ${imagePath}`, error);
        }
      }
    }
  }

  async create(createCityDto: CreateCityDto) {
    // Check if city already exists (case insensitive)
    const existingCity = await this.prisma.city.findFirst({
      where: {
        name: {
          equals: createCityDto.name,
          // Using case insensitive search
          not: undefined,
        },
      },
    });

    if (existingCity) {
      // Delete the uploaded image since we won't be using it
      const imagePath = path.join('public', createCityDto.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
      throw new ConflictException(`City with name "${createCityDto.name}" already exists`);
    }

    const city = await this.prisma.city.create({
      data: createCityDto,
      include: {
        areas: true,
      },
    });

    // Clean up unused images after successful creation
    await this.cleanupUnusedImages();

    return city;
  }

  async findAll() {
    return this.prisma.city.findMany({
      include: {
        areas: true,
      },
    });
  }

  async findOne(id: number) {
    const city = await this.prisma.city.findUnique({
      where: { id },
      include: {
        areas: true,
      },
    });

    if (!city) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }

    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto) {
    try {
      // If updating image, delete old image
      if (updateCityDto.image) {
        const existingCity = await this.prisma.city.findUnique({
          where: { id },
        });
        if (existingCity?.image) {
          const oldImagePath = path.join('public', existingCity.image);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
      }

      const updatedCity = await this.prisma.city.update({
        where: { id },
        data: updateCityDto,
        include: {
          areas: true,
        },
      });

      // Clean up unused images after successful update
      await this.cleanupUnusedImages();

      return updatedCity;
    } catch (error) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
  }

  async remove(id: number) {
    try {
      const city = await this.prisma.city.findUnique({
        where: { id },
      });

      if (!city) {
        throw new NotFoundException(`City with ID ${id} not found`);
      }

      // Delete the image file
      if (city.image) {
        const imagePath = path.join('public', city.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      const deletedCity = await this.prisma.city.delete({
        where: { id },
        include: {
          areas: true,
        },
      });

      // Clean up unused images after successful deletion
      await this.cleanupUnusedImages();

      return deletedCity;
    } catch (error) {
      throw new NotFoundException(`City with ID ${id} not found`);
    }
  }
}
