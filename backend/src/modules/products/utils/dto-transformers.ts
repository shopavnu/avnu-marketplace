import { DeepPartial } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { preprocessDto } from '../../../shared/utils/dto-entity-mapping';

/**
 * Transforms ProductImageDto[] to string[] for entity compatibility
 * @param images Array of ProductImageDto objects
 * @returns Array of image URLs
 */
export function transformProductImages(images?: ProductImageDto[]): string[] | undefined {
  if (!images || !Array.isArray(images)) {
    return undefined;
  }

  return images.map(image => image.url);
}

/**
 * Transforms CreateProductDto to a format compatible with Product entity
 * Handles special cases like:
 * - Converting ProductImageDto[] to string[] for images
 * - Moving merchantId to platformMetadata
 *
 * @param dto Product creation DTO
 * @returns Entity-compatible object
 */
export function transformCreateProductDto(dto: CreateProductDto): DeepPartial<Product> {
  // First handle special JSON fields using the shared utility
  const processed = preprocessDto(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);

  // Create a new object with transformed properties
  const result: unknown = { ...processed };

  // Transform images from ProductImageDto[] to string[]
  if (dto.images) {
    result.images = transformProductImages(dto.images);

    // If there's image metadata in the DTOs, extract it
    result.imageMetadata = dto.images.map(image => ({
      url: image.url,
      width: image.width,
      height: image.height,
      altText: image.altText,
      position: image.position,
    }));
  }

  return result as DeepPartial<Product>;
}

/**
 * Transforms UpdateProductDto to a format compatible with Product entity
 * Similar to transformCreateProductDto but for updates
 *
 * @param dto Product update DTO
 * @returns Entity-compatible object
 */
export function transformUpdateProductDto(dto: UpdateProductDto): DeepPartial<Product> {
  // First handle special JSON fields using the shared utility
  const processed = preprocessDto(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);

  // Create a new object with transformed properties
  const result: unknown = { ...processed };

  // Transform images from ProductImageDto[] to string[]
  if (dto.images) {
    result.images = transformProductImages(dto.images);

    // If there's image metadata in the DTOs, extract it
    result.imageMetadata = dto.images.map(image => ({
      url: image.url,
      width: image.width,
      height: image.height,
      altText: image.altText,
      position: image.position,
    }));
  }

  return result as DeepPartial<Product>;
}
