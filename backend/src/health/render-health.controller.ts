import { Controller, Get } from '@nestjs/common';

@Controller('render-health')
export class RenderHealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      message: 'Avnu Marketplace API is running',
    };
  }
}
