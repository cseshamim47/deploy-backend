import {
  IsNumber,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Status } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  bike_id: number;

  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  start_time: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  end_time: Date;

  @IsEnum(Status)
  @IsOptional()
  status?: Status = Status.pending;

  @IsInt()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsOptional()
  coupon_id?: number;
}
