import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Temporary aliases: allow existing services that use singular model names
  // (e.g., prisma.brand) to continue working after the introspection switched
  // models to plural names (e.g., prisma.brands). Remove these in Phase 3 when
  // services are refactored to use plural delegates directly.
  get brand() {
    return (this as any).brands;
  }
  get product() {
    return (this as any).products;
  }
  get user() {
    return (this as any).users;
  }
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
