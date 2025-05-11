'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.transformProductImages = transformProductImages;
exports.transformCreateProductDto = transformCreateProductDto;
exports.transformUpdateProductDto = transformUpdateProductDto;
const dto_entity_mapping_1 = require('../../../shared/utils/dto-entity-mapping');
function isProductImageDto(image) {
  return typeof image === 'object' && image !== null && 'url' in image;
}
function transformProductImages(images) {
  if (!images || !Array.isArray(images)) {
    return undefined;
  }
  return images.map(image => {
    if (typeof image === 'string') {
      return image;
    }
    return isProductImageDto(image) ? image.url : String(image);
  });
}
function extractImageMetadata(images) {
  return images
    .map(image => {
      if (typeof image === 'string') {
        return { url: image };
      }
      if (isProductImageDto(image)) {
        return {
          url: image.url,
          width: image.width,
          height: image.height,
          altText: image.altText,
          position: image.position,
        };
      }
      return null;
    })
    .filter(item => item !== null);
}
function transformCreateProductDto(dto) {
  const processed = (0, dto_entity_mapping_1.preprocessDto)(dto, [
    { property: 'merchantId', jsonField: 'platformMetadata' },
  ]);
  const result = { ...processed };
  if (dto.images && Array.isArray(dto.images)) {
    result.images = transformProductImages(dto.images);
    const metadata = extractImageMetadata(dto.images);
    if (metadata.length > 0) {
      result.imageMetadata = metadata;
    }
  }
  return result;
}
function transformUpdateProductDto(dto) {
  const processed = (0, dto_entity_mapping_1.preprocessDto)(dto, [
    { property: 'merchantId', jsonField: 'platformMetadata' },
  ]);
  const result = { ...processed };
  if (dto.images && Array.isArray(dto.images)) {
    result.images = transformProductImages(dto.images);
    const metadata = extractImageMetadata(dto.images);
    if (metadata.length > 0) {
      result.imageMetadata = metadata;
    }
  }
  return result;
}
//# sourceMappingURL=dto-transformers.js.map
