import { IsString, IsNotEmpty, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSearchBikeDto {
  @IsString()
  @IsNotEmpty()
  city: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  pickup_time: Date;
}
