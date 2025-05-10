"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productDtoConfig = void 0;
exports.transformProductImages = transformProductImages;
exports.transformBrandInfo = transformBrandInfo;
exports.transformCreateProductDto = transformCreateProductDto;
exports.transformUpdateProductDto = transformUpdateProductDto;
exports.transformProductToDto = transformProductToDto;
const dto_transformers_1 = require("../../../shared/utils/dto-transformers");
const dto_entity_mapping_1 = require("../../../shared/utils/dto-entity-mapping");
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
    const processed = (0, dto_entity_mapping_1.preprocessDto)(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);
    const result = { ...processed };
    result.schemaVersion = 3;
    if (dto.images) {
        const { images, imageMetadata } = transformProductImages(dto.images);
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
        }
        else if (typeof dto.categories === 'object') {
            result.categories = (0, dto_transformers_1.objectArrayToPrimitiveArray)(dto.categories, 'name');
        }
    }
    return result;
}
function transformUpdateProductDto(dto) {
    const processed = (0, dto_entity_mapping_1.preprocessDto)(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);
    const result = { ...processed };
    if (dto.images) {
        const { images, imageMetadata } = transformProductImages(dto.images);
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
        }
        else if (typeof dto.categories === 'object') {
            result.categories = (0, dto_transformers_1.objectArrayToPrimitiveArray)(dto.categories, 'name');
        }
    }
    return result;
}
function transformProductToDto(product) {
    const result = { ...product };
    if (product.platformMetadata && typeof product.platformMetadata === 'object') {
        result.merchantId = product.platformMetadata.merchantId;
    }
    if (product.brandInfo && typeof product.brandInfo === 'object') {
        result.brandName = product.brandInfo.name;
    }
    if (product.images && product.imageMetadata) {
        result.images = product.images.map((url, index) => {
            const metadata = product.imageMetadata && product.imageMetadata[index] ? product.imageMetadata[index] : {};
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
            transformer: (images) => images?.map(img => img.url) || [],
        },
        brandName: {
            targetPath: ['brandInfo'],
            transformer: transformBrandInfo,
        },
    },
    customTransformers: {
        images: (images, obj) => {
            if (!images)
                return undefined;
            const { images: urls, imageMetadata } = transformProductImages(images);
            obj.imageMetadata = imageMetadata;
            return urls;
        },
    },
};
//# sourceMappingURL=product-dto-transformers.js.map