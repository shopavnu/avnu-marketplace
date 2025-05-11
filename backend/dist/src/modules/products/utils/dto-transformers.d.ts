import { DeepPartial } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
export declare function transformProductImages(
  images?: ProductImageDto[] | string[],
): string[] | undefined;
export declare function transformCreateProductDto(dto: CreateProductDto): DeepPartial<Product>;
export declare function transformUpdateProductDto(dto: UpdateProductDto): DeepPartial<Product>;
