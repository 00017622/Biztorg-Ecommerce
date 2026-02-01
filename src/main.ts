import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cors from 'cors';
import { env } from './config/env/env';
import { setupSwagger } from './config/swagger/swagger.config';
import { GLOBAL_PREFIX, CLIENT_URL } from './utils/constants';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(GLOBAL_PREFIX);

  app.use(
    cors({
      origin: [CLIENT_URL, 'http://localhost:5001'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
      ],
      credentials: true,
    }),
  );

  setupSwagger(app);

  const port = env().PORT;

  app.use(cookieParser());

  await app.listen(port, '0.0.0.0');

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`,
  );
}

bootstrap();