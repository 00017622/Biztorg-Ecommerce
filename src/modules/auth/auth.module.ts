import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { JwtStrategy } from 'src/common/strategies/jwt.strategy';
import type { EnvType } from 'src/config/env/env-validation';
import { DrizzleModule } from 'src/database/drizzle.module';
// import { RedisModule } from '../redis/redis.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailService } from './mail.service';
import { GoogleService } from './google.service';
import { FacebookService } from './facebook.service';
import { TelegramGatewayService } from './telegramGateway.service';

@Module({
  imports: [
    ConfigModule,
    DrizzleModule,
    // RedisModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<EnvType>) => ({
        secret: configService.getOrThrow<EnvType['JWT_SECRET']>('JWT_SECRET'),
        signOptions: {
          expiresIn: '30d',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, MailService, GoogleService, FacebookService, TelegramGatewayService],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
