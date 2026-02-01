/* eslint-disable @typescript-eslint/no-unsafe-argument */
import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import basicAuth from 'express-basic-auth';

export function setupSwagger(app: INestApplication): void {
  const swaggerUser = process.env.SWAGGER_USER;
  const swaggerPassword = process.env.SWAGGER_PASSWORD;

  
  if (!swaggerUser || !swaggerPassword) {
    return;
  }

  app.use(
    '/docs',
    basicAuth({
      challenge: true,
      users: {
        [swaggerUser]: swaggerPassword,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('BizTorg API Docs')
    .setDescription(
      'Here you can see all the endpoints with request/response examples',
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'none',
      persistAuthorization: true,
    },
  });
}
