import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsInt,
  Min,
  IsEnum,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OfferStatus } from '../entities/offer.entity';

export class CreateOfferDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  above_amount: number;

  // Image will be handled by file upload
  image: string;

  @IsString()
  @IsNotEmpty()
  coupon: string;

  @IsEnum(OfferStatus)
  @IsOptional()
  status?: OfferStatus = OfferStatus.active;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}
