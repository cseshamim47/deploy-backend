import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Headers,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('send-otp')
  async sendOTP(@Body() sendOtpDto: SendOtpDto) {
    console.log('came here');
    return this.authService.sendOTP(sendOtpDto.phone);
  }

  @Post('verify-otp')
  async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOTP(
      verifyOtpDto.phone,
      verifyOtpDto.otp,
      verifyOtpDto.firstName,
      verifyOtpDto.lastName,
      verifyOtpDto.email,
    );
  }

  @Post('verify-token')
  async verifyToken(@Headers('authorization') authHeader: string) {
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { valid: false, message: 'No token provided' };
    }

    const token = authHeader.split(' ')[1].trim();
    console.log('Extracted token:', token);

    return this.authService.verifyToken(token);
  }
}
