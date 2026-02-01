import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { EnvModule } from './config/env/env.module';
import { ZodValidationPipe, ZodSerializerInterceptor} from 'nestjs-zod';
import { DrizzleModule } from './database/drizzle.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ZodSerializerInterceptorCustom } from './common/interceptors/zod.response-checker.interceptor';
import { HttpExceptionFilter } from './common/filters/http.exception.filter';
import { DrizzleExceptionFilter } from './common/filters/drizzle.exception.filter';
import { ZodExceptionFilter } from './common/filters/zod.exception.filter';
import { CategoryModule } from './modules/category/category.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ProductModule } from './modules/product/product.module';
import { RegionModule } from './modules/region/region.module';
import { FirebaseModule } from './modules/firebase/firebase.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ConversationModule } from './modules/conversation/conversation.module';
import { MessageModule } from './modules/message/message.module';
import { ShopProfileModule } from './modules/shopProfile/shopProfile.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AIModule } from './modules/AI/AI.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/public', 
      exclude: ['/api', '/public/messages/image*'], 
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        secure: false,
        auth: {
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
      template: {
        dir: join(process.cwd(), 'src', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: { strict: true },
      },
    }), EnvModule, DrizzleModule, RedisModule, AuthModule, ProfileModule, ShopProfileModule, CategoryModule, ProductModule,
     RegionModule, ConversationModule, MessageModule, AIModule, NotificationModule, JobsModule, WebsocketModule, FirebaseModule],
  controllers: [AppController],
  providers: [
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptorCustom },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_FILTER, useClass: DrizzleExceptionFilter },
    { provide: APP_FILTER, useClass: ZodExceptionFilter },
  ],
})
export class AppModule {}
