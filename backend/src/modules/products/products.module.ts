import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ProductsService } from './products.service';
import { ProductService, CategoryService } from './services';
import { ProductsController } from './products.controller';
import { ProductsResolver } from './products.resolver';
import { Product } from './entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), EventEmitterModule.forRoot()],
  controllers: [ProductsController],
  providers: [ProductsService, ProductService, CategoryService, ProductsResolver],
  exports: [ProductsService, ProductService, CategoryService],
})
export class ProductsModule {}
