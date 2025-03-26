import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { BikeService } from './bike.service';
import { CreateBikeDto } from './dto/create-bike.dto';
import { UpdateBikeDto } from './dto/update-bike.dto';
import { ParseDatePipe } from './pipes/parse-date.pipe';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadService } from '../common/services/file-upload.service';
import { SearchBikeDto } from './dto/search-bike.dto';
import { TimeSearchBikeDto } from './dto/time-search.dto';

@Controller('bike')
export class BikeController {
  constructor(
    private readonly bikeService: BikeService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('bike'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async create(
    @Body() createBikeDto: CreateBikeDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = this.fileUploadService.getImageUrl('bike', file.filename);
    return this.bikeService.create({
      ...createBikeDto,
      image: imageUrl,
    });
  }

  @Post('search')
  searchAvailableBikes(@Body() searchBikeDto: SearchBikeDto) {
    return this.bikeService.searchAvailableBikes(searchBikeDto);
  }

  @Post('time-search')
  searchByTimeSlots(@Body() timeSearchDto: TimeSearchBikeDto) {
    return this.bikeService.searchByTimeSlots(timeSearchDto);
  }

  @Get()
  findAll() {
    return this.bikeService.findAll();
  }

  @Get('city/:city')
  findByCity(
    @Param('city') city: string,
    @Query('name') name?: string,
    @Query('start_time', new ParseDatePipe({ optional: true }))
    start_time?: Date,
    @Query('end_time', new ParseDatePipe({ optional: true })) end_time?: Date,
  ) {
    return this.bikeService.findByCity(city, name, start_time, end_time);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bikeService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: FileUploadService.getStorage('bike'),
      fileFilter: FileUploadService.imageFileFilter,
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateBikeDto: UpdateBikeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      const imageUrl = this.fileUploadService.getImageUrl(
        'bike',
        file.filename,
      );
      updateBikeDto.image = imageUrl;
    }
    return this.bikeService.update(+id, updateBikeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bikeService.remove(+id);
  }
}
