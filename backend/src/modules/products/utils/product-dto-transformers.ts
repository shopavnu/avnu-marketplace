import { DeepPartial } from 'typeorm';
import { Product } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductImageDto } from '../dto/product-image.dto';
import { ProductVariantDto } from '../dto/product-variant.dto';
import { transformDto, objectArrayToPrimitiveArray } from '../../../shared/utils/dto-transformers';
import { preprocessDto } from '../../../shared/utils/dto-entity-mapping';

/**
 * Structural mismatches between Product DTOs and Entity:
 *
 * 1. images: ProductImageDto[] (DTO) vs string[] (Entity)
 * 2. merchantId: string (DTO) vs platformMetadata.merchantId (Entity)
 * 3. brandName: string (DTO) vs brandInfo.name (Entity)
 * 4. variants: ProductVariantDto[] (DTO) vs variations relationship (Entity)
 */

/**
 * Interface for brand information
 */
interface BrandInfo {
  id: string;
  name: string;
  description: string;
  logo: string;
  website: string;
}

/**
 * Extended DTO interfaces to support both old (brandName) and new (brandInfo) formats
 */
interface ExtendedCreateProductDto extends CreateProductDto {
  brandName?: string;
  [key: string]: unknown;
}

interface ExtendedUpdateProductDto extends UpdateProductDto {
  brandName?: string;
  [key: string]: unknown;
}

/**
 * Interface for image metadata extracted from ProductImageDto
 */
interface ImageMetadata {
  url: string;
  width?: number;
  height?: number;
  altText?: string;
  position?: number;
  format: string;
}

/**
 * Transforms ProductImageDto[] to string[] for entity compatibility
 * Also extracts metadata to populate the imageMetadata field
 *
 * @param images Array of ProductImageDto objects
 * @returns Object with images and imageMetadata
 */
export function transformProductImages(images?: ProductImageDto[]): {
  images?: string[];
  imageMetadata?: ImageMetadata[];
} {
  if (!images || !Array.isArray(images)) {
    return {};
  }

  // Extract URLs for the images array
  const imageUrls = images.map(image => image.url);

  // Extract metadata for the imageMetadata array
  const metadata = images.map(image => ({
    url: image.url,
    width: image.width,
    height: image.height,
    altText: image.altText,
    position: image.position,
    format: image.url.split('.').pop()?.toLowerCase() || 'unknown',
  }));

  return {
    images: imageUrls,
    imageMetadata: metadata,
  };
}

/**
 * Transforms a brand name string into the expected brandInfo object structure
 */
export function transformBrandInfo(brandName?: string): BrandInfo | undefined {
  if (!brandName) {
    return undefined;
  }

  return {
    name: brandName,
    id: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    description: '',
    logo: '',
    website: '',
  };
}

/**
 * Transforms CreateProductDto to a format compatible with Product entity
 * Handles all structural mismatches between DTO and entity
 *
 * @param dto Product creation DTO
 * @returns Entity-compatible object
 */
export function transformCreateProductDto(dto: ExtendedCreateProductDto): DeepPartial<Product> {
  // First handle JSON field properties like merchantId
  const processed = preprocessDto(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);

  // Create a new object with transformed properties
  const result: unknown = { ...processed };

  // Add schema version
  result.schemaVersion = 3; // Current schema version

  // Transform images from ProductImageDto[] to string[] and extract metadata
  if (dto.images) {
    const { images, imageMetadata } = transformProductImages(dto.images);
    result.images = images;
    result.imageMetadata = imageMetadata;
  }

  // Transform brand information if provided
  if (dto.brandName) {
    result.brandInfo = transformBrandInfo(dto.brandName);
    delete result.brandName;
  }

  // Handle categories if they're not in the expected format
  if (dto.categories && !Array.isArray(dto.categories)) {
    if (typeof dto.categories === 'string') {
      result.categories = [dto.categories];
    } else if (typeof dto.categories === 'object') {
      // Handle case where categories might be an array of objects
      result.categories = objectArrayToPrimitiveArray(dto.categories as any[], 'name');
    }
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
export function transformUpdateProductDto(dto: ExtendedUpdateProductDto): DeepPartial<Product> {
  // First handle JSON field properties like merchantId
  const processed = preprocessDto(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);

  // Create a new object with transformed properties
  const result: unknown = { ...processed };

  // Transform images from ProductImageDto[] to string[] and extract metadata
  if (dto.images) {
    const { images, imageMetadata } = transformProductImages(dto.images);
    result.images = images;
    result.imageMetadata = imageMetadata;
  }

  // Transform brand information if provided
  if (dto.brandName) {
    result.brandInfo = transformBrandInfo(dto.brandName);
    delete result.brandName;
  }

  // Handle categories if they're not in the expected format
  if (dto.categories && !Array.isArray(dto.categories)) {
    if (typeof dto.categories === 'string') {
      result.categories = [dto.categories];
    } else if (typeof dto.categories === 'object') {
      // Handle case where categories might be an array of objects
      result.categories = objectArrayToPrimitiveArray(dto.categories as any[], 'name');
    }
  }

  return result as DeepPartial<Product>;
}

/**
 * Transforms a Product entity to a DTO-compatible format for API responses
 * Handles the reverse transformation from entity to DTO format
 *
 * @param product Product entity
 * @returns DTO-compatible object
 */
export function transformProductToDto(product: Product): Record<string, unknown> {
  const result: Record<string, unknown> = { ...product };

  // Extract merchantId from platformMetadata
  if (product.platformMetadata && typeof product.platformMetadata === 'object') {
    result.merchantId = product.platformMetadata.merchantId;
  }

  // Extract brandName from brandInfo
  if (product.brandInfo && typeof product.brandInfo === 'object') {
    result.brandName = product.brandInfo.name;
  }

  // Transform imageMetadata back to ProductImageDto format if needed
  if (product.images && product.imageMetadata) {
    result.images = product.images.map((url, index) => {
      const metadata =
        product.imageMetadata && product.imageMetadata[index] ? product.imageMetadata[index] : {};

      return {
        url,
        altText: 'altText' in metadata ? metadata.altText : undefined,
        width: 'width' in metadata ? metadata.width : undefined,
        height: 'height' in metadata ? metadata.height : undefined,
        position: 'position' in metadata ? metadata.position : index,
      };
    });
  }

  return result;
}

/**
 * Configuration for the product DTO transformer
 * Used with the generic transformDto function
 */
export const productDtoConfig = {
  jsonFields: {
    merchantId: 'platformMetadata',
  },
  transform: {
    images: {
      targetPath: ['images'],
      transformer: (images: ProductImageDto[]) => images?.map(img => img.url) || [],
    },
    brandName: {
      targetPath: ['brandInfo'],
      transformer: transformBrandInfo,
    },
  },
  customTransformers: {
    images: (images: ProductImageDto[], obj: unknown) => {
      if (!images) return undefined;

      const { images: urls, imageMetadata } = transformProductImages(images);
      obj.imageMetadata = imageMetadata;
      return urls;
    },
  },
};
