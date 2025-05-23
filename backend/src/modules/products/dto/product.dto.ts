import {
  IsString,
  IsNumber,
  IsOptional,
  IsUrl,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VariantDto {
  @IsString()
  optionName: string;

  @IsString()
  optionValue: string;

  @IsNumber()
  @Min(0)
  stock: number;
}

export class CreateProductDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsUrl()
  imageUrl: string;

  @IsString()
  brandId: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantDto)
  variants?: VariantDto[];
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  brandId?: string;
}

export class ProductResponseDto {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  brandId: string;
  brand?: any;
  variants?: any[];
}
