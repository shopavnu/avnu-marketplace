import { Module } from '@nestjs/common';
import { ProductsPrismaService } from './services/products-prisma.service';
import { ProductsPrismaResolver } from './resolvers/products-prisma.resolver';
import { ProductsController } from './controllers/products.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProductsPrismaService, ProductsPrismaResolver],
  controllers: [ProductsController],
  exports: [ProductsPrismaService],
})
export class ProductsPrismaModule {}
