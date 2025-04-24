import { ObjectType } from '@nestjs/graphql';
import { Paginated } from '@common/dto/pagination.dto';
import { Product } from '../entities/product.entity';

@ObjectType()
export class ProductPaginatedResponse extends Paginated(Product) {}
