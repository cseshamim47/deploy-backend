import { IsString, IsEmail, IsPhoneNumber, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  //@IsPhoneNumber()
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  address: string;

  @IsEnum(['user', 'admin'])
  role: string;
}
