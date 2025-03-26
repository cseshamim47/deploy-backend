import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import * as fs from 'fs';

@Controller('offer')
export class OfferController {
  constructor(
    private readonly offerService: OfferService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('offer'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = this.fileUploadService.getImageUrl('offer', file.filename);
    
    try {
      const result = await this.offerService.create({
        ...createOfferDto,
        image: imageUrl,
      });
      return result;
    } catch (error) {
      // Always delete uploaded file if there's an error
      const fullPath = `./public/offer/${file.filename}`;
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
    return this.offerService.findAll();
  }

  @Get('valid')
  findValidOffers(@Query('amount') amount: string) {
    return this.offerService.findValidOffers(+amount);
  }

  @Get('coupon/:coupon')
  findByCoupon(@Param('coupon') coupon: string) {
    return this.offerService.findByCoupon(coupon);
  }

  @Get(':id/check-validity')
  checkValidity(@Param('id') id: string) {
    return this.offerService.checkOfferValidity(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offerService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('offer'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateOfferDto: UpdateOfferDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    let imageUrl;
    if (file) {
      imageUrl = this.fileUploadService.getImageUrl('offer', file.filename);
    }
    
    try {
      const result = await this.offerService.update(+id, {
        ...updateOfferDto,
        ...(imageUrl && { image: imageUrl }),
      });
      return result;
    } catch (error) {
      // Delete uploaded file if there was an error and a file was uploaded
      if (file) {
        const fullPath = `./public/offer/${file.filename}`;
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
    return this.offerService.remove(+id);
  }

  @Delete()
  removeAll() {
    return this.offerService.removeAll();
  }
}
