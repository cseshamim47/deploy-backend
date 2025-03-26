import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import * as fs from 'fs';

@Controller('service')
export class ServiceController {
  constructor(
    private readonly serviceService: ServiceService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('service'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async create(
    @Body() createServiceDto: CreateServiceDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log("ashsi ekhane");
    
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = this.fileUploadService.getImageUrl('service', file.filename);

    try {
      const result = await this.serviceService.create({
        ...createServiceDto,
        image: imageUrl,
      });
      return result;
    } catch (error) {
      // Always delete uploaded file if there's an error
      const fullPath = `./public/service/${file.filename}`;
      try {
        fs.unlinkSync(fullPath);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
      // Re-throw the original error
      throw error;
    }
  }

  @Get()
  findAll() {
    return this.serviceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('service'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl;
    if (file) {
      imageUrl = this.fileUploadService.getImageUrl('service', file.filename);
    }

    try {
      const result = await this.serviceService.update(+id, {
        ...updateServiceDto,
        ...(imageUrl && { image: imageUrl }),
      });
      return result;
    } catch (error) {
      // Delete uploaded file if there was an error and a file was uploaded
      if (file) {
        const fullPath = `./public/service/${file.filename}`;
        try {
          fs.unlinkSync(fullPath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      throw error;
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(+id);
  }

  @Delete()
  removeAll() {
    return this.serviceService.removeAll();
  }
}
