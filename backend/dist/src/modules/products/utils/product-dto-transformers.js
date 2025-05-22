'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.productDtoConfig = void 0;
exports.transformProductImages = transformProductImages;
exports.transformBrandInfo = transformBrandInfo;
exports.transformCreateProductDto = transformCreateProductDto;
exports.transformUpdateProductDto = transformUpdateProductDto;
exports.transformProductToDto = transformProductToDto;
function objectArrayToPrimitiveArray(arr, property) {
  if (!arr || !Array.isArray(arr)) return [];
  return arr.map(item => item[property]);
}
function preprocessDto(dto, mappings) {
  const result = { ...dto };
  for (const mapping of mappings) {
    const { property, jsonField } = mapping;
    if (property in result) {
      if (!result[jsonField]) {
        result[jsonField] = {};
      }
      result[jsonField] = {
        ...result[jsonField],
        [property]: result[property],
      };
      delete result[property];
    }
  }
  return result;
}
function _transformDto(dto, _config) {
  const result = { ...dto };
  return result;
}
function ensureProductImageDtos(images) {
  if (!images) return [];
  return Array.isArray(images)
    ? images.map(img => (typeof img === 'string' ? { url: img } : img))
    : [];
}
function transformProductImages(images) {
  if (!images || !Array.isArray(images)) {
    return {};
  }
  const imageUrls = images.map(image => image.url);
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
function transformBrandInfo(brandName) {
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
function transformCreateProductDto(dto) {
  const processed = preprocessDto(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);
  const result = { ...processed };
  result.schemaVersion = 3;
  if (dto.images) {
    const imageObjects = ensureProductImageDtos(dto.images);
    const { images, imageMetadata } = transformProductImages(imageObjects);
    result.images = images;
    result.imageMetadata = imageMetadata;
  }
  if (dto.brandName) {
    result.brandInfo = transformBrandInfo(dto.brandName);
    delete result.brandName;
  }
  if (dto.categories && !Array.isArray(dto.categories)) {
    if (typeof dto.categories === 'string') {
      result.categories = [dto.categories];
    } else if (typeof dto.categories === 'object') {
      result.categories = objectArrayToPrimitiveArray(dto.categories, 'name');
    }
  }
  return result;
}
function transformUpdateProductDto(dto) {
  const processed = preprocessDto(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);
  const result = { ...processed };
  if (dto.images) {
    const imageObjects = ensureProductImageDtos(dto.images);
    const { images, imageMetadata } = transformProductImages(imageObjects);
    result.images = images;
    result.imageMetadata = imageMetadata;
  }
  if (dto.brandName) {
    result.brandInfo = transformBrandInfo(dto.brandName);
    delete result.brandName;
  }
  if (dto.categories && !Array.isArray(dto.categories)) {
    if (typeof dto.categories === 'string') {
      result.categories = [dto.categories];
    } else if (typeof dto.categories === 'object') {
      result.categories = objectArrayToPrimitiveArray(dto.categories, 'name');
    }
  }
  return result;
}
function transformProductToDto(product) {
  const result = { ...product };
  const platformMetadata = product.platformMetadata;
  if (platformMetadata && typeof platformMetadata === 'object') {
    result.merchantId = platformMetadata.merchantId;
  }
  const brandInfo = product.brandInfo;
  if (brandInfo && typeof brandInfo === 'object') {
    result.brandName = brandInfo.name;
  }
  const images = product.images;
  const imageMetadata = product.imageMetadata;
  if (images && Array.isArray(images) && imageMetadata && Array.isArray(imageMetadata)) {
    result.images = images.map((url, index) => {
      const metadata = imageMetadata[index] || {};
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
exports.productDtoConfig = {
  jsonFields: {
    merchantId: 'platformMetadata',
  },
  transform: {
    images: {
      targetPath: ['images'],
      transformer: images => {
        const imageObjects = ensureProductImageDtos(images);
        return imageObjects.map(img => img.url);
      },
    },
    brandName: {
      targetPath: ['brandInfo'],
      transformer: transformBrandInfo,
    },
  },
  customTransformers: {
    images: (images, obj) => {
      if (!images) return undefined;
      const imageObjects = ensureProductImageDtos(images);
      const { images: urls, imageMetadata } = transformProductImages(imageObjects);
      obj.imageMetadata = imageMetadata;
      return urls;
    },
  },
};
//# sourceMappingURL=product-dto-transformers.js.map
