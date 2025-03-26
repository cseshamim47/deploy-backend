import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { BikeModule } from './bike/bike.module';
import { PrismaModule } from './prisma/prisma.module';
import { PaymentModule } from './payment/payment.module';
import { AdminModule } from './admin/admin.module';
import { BookingModule } from './booking/booking.module';
import { OfferModule } from './offer/offer.module';
import { LoggerModule } from 'nestjs-pino';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path'; // ✅ Import 'join' from 'path'
import { ServiceModule } from './service/service.module';
import { CityModule } from './city/city.module';
import { AuthModule } from './auth/auth.module';
import { AreaModule } from './area/area.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes env variables available throughout the app
    }),
    UserModule,
    BikeModule,
    PrismaModule,
    AdminModule,
    PaymentModule,
    BookingModule,
    OfferModule,
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
        },
        level: 'info',
        serializers: {
          req(req) {
            return { method: req.method, url: req.url }; // ✅ Simplified request log
          },
          res(res) {
            return { statusCode: res.statusCode }; // ✅ Only logs status
          },
        },
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'), // Pointing to /public/offer/
      serveRoot: '/static', // Access images via /static/
    }),
    ServiceModule,
    CityModule,
    AuthModule,
    AreaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
