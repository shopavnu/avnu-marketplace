import { Controller, Get, Head } from '@nestjs/common';

export class RenderHealthController {
  @Get('render-health')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      message: 'Avnu Marketplace API is running',
    };
  }

  @Get('healthz')
  healthz() {
    // Simple 200 OK for Render's /healthz check
    return { status: 'ok' };
  }

  @Head('/')
  rootHead() {
    // Simple 200 OK for Render's HEAD / check
    // No body needed for HEAD requests, NestJS handles this.
    return;
  }
}
