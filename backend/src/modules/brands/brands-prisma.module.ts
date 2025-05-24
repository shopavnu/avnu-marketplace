import { Module } from '@nestjs/common';
import { BrandsPrismaService } from './services/brands-prisma.service';
import { BrandsPrismaResolver } from './resolvers/brands-prisma.resolver';
import { BrandsController } from './controllers/brands.controller';

@Module({
  providers: [BrandsPrismaService, BrandsPrismaResolver],
  controllers: [BrandsController],
  exports: [BrandsPrismaService],
})
export class BrandsPrismaModule {}
