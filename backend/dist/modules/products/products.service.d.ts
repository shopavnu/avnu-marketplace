import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
export declare class ProductsService {
  private readonly productsRepository;
  private readonly eventEmitter;
  constructor(productsRepository: Repository<Product>, eventEmitter: EventEmitter2);
  create(createProductDto: CreateProductDto): Promise<Product>;
  findAll(paginationDto: PaginationDto): Promise<{
    items: Product[];
    total: number;
  }>;
  findOne(id: string): Promise<Product>;
  findByExternalId(externalId: string, externalSource: string): Promise<Product>;
  findByIds(ids: string[]): Promise<Product[]>;
  findAllForIndexing(): Promise<Product[]>;
  update(id: string, updateProductDto: UpdateProductDto): Promise<Product>;
  remove(id: string): Promise<void>;
  search(
    query: string,
    paginationDto: PaginationDto,
    filters?: {
      categories?: string[];
      priceMin?: number;
      priceMax?: number;
      merchantId?: string;
      inStock?: boolean;
      values?: string[];
    },
  ): Promise<{
    items: Product[];
    total: number;
  }>;
  findByMerchant(
    merchantId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Product[];
    total: number;
  }>;
  updateStock(id: string, inStock: boolean, quantity?: number): Promise<Product>;
  bulkCreate(products: CreateProductDto[]): Promise<Product[]>;
  bulkUpdate(
    products: {
      id: string;
      data: UpdateProductDto;
    }[],
  ): Promise<Product[]>;
  getRecommendedProducts(userId: string, limit?: number): Promise<Product[]>;
  getDiscoveryProducts(limit?: number): Promise<Product[]>;
}
