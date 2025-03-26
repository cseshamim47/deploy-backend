import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  create(createServiceDto: CreateServiceDto) {
    return this.prisma.service.create({
      data: createServiceDto,
    });
  }

  findAll() {
    return this.prisma.service.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  update(id: number, updateServiceDto: UpdateServiceDto) {
    return this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async remove(id: number) {
    // Get the service to delete its image
    const service = await this.prisma.service.findUnique({
      where: { id },
    });

    // Delete the image file if it exists
    if (service?.image) {
      const imagePath = service.image.split('/').pop();
      if (imagePath) {
        const fullPath = path.join(process.cwd(), 'public', 'services', imagePath);
        try {
          fs.unlinkSync(fullPath);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }
    }
    return this.prisma.service.delete({
      where: { id },
    });
  }

  async removeAll() {
    // Get all services to delete their images
    const services = await this.prisma.service.findMany();

    // Delete all image files
    const serviceDir = path.join(process.cwd(), 'public', 'service');
    try {
      // Delete all files in the services directory
      const files = fs.readdirSync(serviceDir);
      for (const file of files) {
        fs.unlinkSync(path.join(serviceDir, file));
      }
    } catch (error) {
      console.error('Error deleting image directory:', error);
    }

    // Delete all services from database
    return this.prisma.service.deleteMany();
  }
}
