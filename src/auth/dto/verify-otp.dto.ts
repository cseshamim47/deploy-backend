import { IsString, IsPhoneNumber, Length, IsOptional, IsEmail } from 'class-validator';

export class VerifyOtpDto {
  //@IsPhoneNumber()
  phone: string;

  @IsString()
  @Length(4, 4)
  otp: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
} 