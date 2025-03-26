import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // Image will be handled by file upload
  image: string;
}
