import { DeepPartial } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { preprocessDto } from '../../../shared/utils/dto-entity-mapping';

interface ImageMetadata {
  url: string;
  width?: number;
  height?: number;
  altText?: string;
  position?: number;
}

/**
 * Checks if an image is a ProductImageDto object
 * @param image Object to check
 * @returns True if the image is a ProductImageDto
 */
function isProductImageDto(image: any): image is ProductImageDto {
  return typeof image === 'object' && image !== null && 'url' in image;
}

/**
 * Transforms ProductImageDto[] or string[] to string[] for entity compatibility
 * @param images Array of ProductImageDto objects or string URLs
 * @returns Array of image URLs
 */
export function transformProductImages(
  images?: ProductImageDto[] | string[],
): string[] | undefined {
  if (!images || !Array.isArray(images)) {
    return undefined;
  }

  // Handle both string[] and ProductImageDto[] formats
  return images.map(image => {
    // If image is already a string, return it directly
    if (typeof image === 'string') {
      return image;
    }
    // Otherwise, assume it's a ProductImageDto and extract the URL
    return isProductImageDto(image) ? image.url : String(image);
  });
}

/**
 * Extracts metadata from image objects safely
 * @param images Array of images to extract metadata from
 * @returns Array of image metadata objects
 */
function extractImageMetadata(images: (ProductImageDto | string)[]): ImageMetadata[] {
  return images
    .map(image => {
      if (typeof image === 'string') {
        // For string images, just provide the URL
        return { url: image };
      }

      if (isProductImageDto(image)) {
        // For ProductImageDto objects, extract all metadata
        return {
          url: image.url,
          width: image.width,
          height: image.height,
          altText: image.altText,
          position: image.position,
        };
      }

      return null; // Skip invalid items
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);
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

  // Create a strongly-typed result object
  const result: DeepPartial<Product> = { ...processed };

  // Transform images from ProductImageDto[] to string[]
  if (dto.images && Array.isArray(dto.images)) {
    result.images = transformProductImages(dto.images);

    // Extract image metadata safely
    const metadata = extractImageMetadata(dto.images);
    if (metadata.length > 0) {
      result.imageMetadata = metadata as any;
    }
  }

  return result;
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

  // Create a strongly-typed result object
  const result: DeepPartial<Product> = { ...processed };

  // Transform images from ProductImageDto[] to string[]
  if (dto.images && Array.isArray(dto.images)) {
    result.images = transformProductImages(dto.images);

    // Extract image metadata safely
    const metadata = extractImageMetadata(dto.images);
    if (metadata.length > 0) {
      result.imageMetadata = metadata as any;
    }
  }

  return result;
}
