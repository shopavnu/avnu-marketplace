// Import polyfills first to ensure global objects are available
import './polyfills';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './prisma';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Enable CORS with explicit origin and credentials for cookies/JWT
  // Support multiple dev front-end origins (e.g. Next.js default 3000 or custom 3001)
  const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:3001,http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filters
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Get config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  // Setup Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('av | nu Marketplace API')
    .setDescription('API documentation for av | nu marketplace')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
