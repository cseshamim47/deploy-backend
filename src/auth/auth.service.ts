import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import axios from 'axios';

interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  // Generate a 4-digit OTP
  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Send OTP via AiSensy
  async sendOTP(phone: string) {
    // return { message: 'OTP sent successfully' };
    phone = `(+91)(${phone})`;
    // phone = '(+91)(01878042329)';
    //console.log(phone);
    const otp = this.generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Remove users with expired OTPs
    await this.prisma.user.deleteMany({
      where: {
        otpExpiry: { lt: new Date() },
        // Only delete temporary users (those with temp email)
        email: { contains: '@temp.com' },
      },
    });

    // Find user
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (user) {
      await this.prisma.user.update({
        where: { phone },
        data: {
          otp: hashedOtp,
          // otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    } else {
      // Create temporary user entry with just phone and OTP
      // Generate a unique temporary email based on phone number and timestamp
      const tempEmail = `temp_${phone}_${Date.now()}@temp.com`;

      await this.prisma.user.create({
        data: {
          phone,
          name: 'Temporary User', // Temporary name
          email: tempEmail, // Unique temporary email
          address: '',
          role: 'user',
          otp: hashedOtp,
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000),
        },
      });
    }

    try {
      // Send OTP via AiSensy with updated request format
      await axios.post('https://backend.aisensy.com/campaign/t1/api/v2', {
        apiKey: process.env.AISENSY_API_KEY,
        campaignName: 'OTP Verification Campaign',
        destination: phone,
        userName: 'Ever Green Travels',
        templateParams: [otp],
        source: 'new-landing-page form',
        media: {},
        buttons: [
          {
            type: 'button',
            sub_type: 'url',
            index: 0,
            parameters: [
              {
                type: 'text',
                text: otp,
              },
            ],
          },
        ],
        carouselCards: [],
        location: {},
        paramsFallbackValue: {
          FirstName: 'user',
        },
      });

      return { message: 'OTP sent successfully' };
    } catch (error) {
      console.error(
        'Aisensy API Error:',
        error.response?.data || error.message,
      );
      throw new BadRequestException('Failed to send OTP. Please try again.');
    }
  }

  // Verify OTP and login
  async verifyOTP(
    phone: string,
    otp: string,
    firstName: string,
    lastName: string,
    email: string,
  ) {
    phone = `(+91)(${phone})`;
    // console.log(phone);
    // phone = '(+91)(01878042329)';
    // console.log('verify: ', phone);
    // console.log(otp);

    const user = await this.prisma.user.findUnique({
      where: { phone },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        role: true,
        otp: true,
        otpExpiry: true,
      },
    });

    if (!user || !user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired or invalid');
    }

    console.log('came here');

    const isValid = await bcrypt.compare(otp, user.otp);

    if (!isValid) throw new BadRequestException('Invalid OTP');

    //Update user details if provided
    if (email && !email.includes('@temp.com')) {
      await this.prisma.user.update({
        where: { phone },
        data: {
          name: `${firstName} ${lastName}`,
          email: email,
        },
      });
    }

    console.log(isValid);

    // Generate JWT token
    const token = this.jwtService.sign({
      id: user.id,
      phone: user.phone,
      name: user.name,
      email: user.email,
      role: user.role,
    });
    console.log('came here');
    // Clear OTP after verification
    // await this.prisma.user.update({
    //   where: { phone },
    //   data: { otp: null, otpExpiry: null },
    // });

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async verifyToken(token: string) {
    try {
      console.log('Received token:', token);

      // Check if token contains any whitespace or special characters
      if (token.includes(' ') || /[^A-Za-z0-9\-_\.]/g.test(token)) {
        console.log('Token contains invalid characters');
        return {
          valid: false,
          message: 'Invalid token format',
        };
      }

      // First try to decode without verification
      const decodedWithoutVerify = this.jwtService.decode(token);
      console.log('Token decoded without verification:', decodedWithoutVerify);

      // Now try to verify
      const decoded = this.jwtService.verify(token);
      console.log('Token verified successfully:', decoded);

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          phone: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        console.log('User not found for id:', decoded.id);
        throw new BadRequestException('User not found');
      }

      return {
        valid: true,
        user,
      };
    } catch (error) {
      console.log('Token verification error:', error.message);
      console.log('Error details:', error);

      // Log the current JWT_SECRET being used (but don't show the full secret)
      const secretPreview = process.env.JWT_SECRET
        ? `${process.env.JWT_SECRET.substring(0, 3)}...`
        : 'not found';
      console.log('JWT_SECRET preview:', secretPreview);

      return {
        valid: false,
        message: 'Invalid token',
        error: error.message, // Including error message in response for debugging
      };
    }
  }
}
