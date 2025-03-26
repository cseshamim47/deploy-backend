import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchBikeDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  pickup_date: Date;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  dropoff_date: Date;
}
