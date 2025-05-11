'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = require('@nestjs/core');
const app_module_1 = require('./app.module');
const common_1 = require('@nestjs/common');
const config_1 = require('@nestjs/config');
const swagger_1 = require('@nestjs/swagger');
async function bootstrap() {
  const app = await core_1.NestFactory.create(app_module_1.AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new common_1.ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  const configService = app.get(config_1.ConfigService);
  const port = configService.get('PORT') || 3001;
  const config = new swagger_1.DocumentBuilder()
    .setTitle('av | nu Marketplace API')
    .setDescription('API documentation for av | nu marketplace')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = swagger_1.SwaggerModule.createDocument(app, config);
  swagger_1.SwaggerModule.setup('api/docs', app, document);
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
//# sourceMappingURL=main.js.map
