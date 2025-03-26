import { IsString, IsNumber, IsNotEmpty, Min, IsInt } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateBikeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Image will be handled by file upload
  image: string;

  @IsString()
  @IsNotEmpty()
  type: string;


  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  area: string;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  day_price: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  seven_day_price: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  fifteen_day_price: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  month_price: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  limit: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  extra: number;

  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  deposit: number;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1900)
  make_year: number;

  @IsString()
  @IsNotEmpty()
  serial: string;
}
