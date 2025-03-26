import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';

@Controller('city')
export class CityController {
  constructor(
    private readonly cityService: CityService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('city'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async create(
    @Body() createCityDto: CreateCityDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = this.fileUploadService.getImageUrl('city', file.filename);
    return this.cityService.create({
      ...createCityDto,
      image: imageUrl,
    });
  }

  @Get()
  findAll() {
    return this.cityService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('city'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCityDto: UpdateCityDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const imageUrl = this.fileUploadService.getImageUrl('city', file.filename);
      updateCityDto.image = imageUrl;
    }
    return this.cityService.update(id, updateCityDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cityService.remove(id);
  }
}
