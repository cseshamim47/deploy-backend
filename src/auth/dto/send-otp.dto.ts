import { IsString, IsPhoneNumber } from 'class-validator';

export class SendOtpDto {
  //@IsPhoneNumber()
  phone: string;
} 