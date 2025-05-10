"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformProductImages = transformProductImages;
exports.transformCreateProductDto = transformCreateProductDto;
exports.transformUpdateProductDto = transformUpdateProductDto;
const dto_entity_mapping_1 = require("../../../shared/utils/dto-entity-mapping");
function transformProductImages(images) {
    if (!images || !Array.isArray(images)) {
        return undefined;
    }
    return images.map(image => image.url);
}
function transformCreateProductDto(dto) {
    const processed = (0, dto_entity_mapping_1.preprocessDto)(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);
    const result = { ...processed };
    if (dto.images) {
        result.images = transformProductImages(dto.images);
        result.imageMetadata = dto.images.map(image => ({
            url: image.url,
            width: image.width,
            height: image.height,
            altText: image.altText,
            position: image.position,
        }));
    }
    return result;
}
function transformUpdateProductDto(dto) {
    const processed = (0, dto_entity_mapping_1.preprocessDto)(dto, [{ property: 'merchantId', jsonField: 'platformMetadata' }]);
    const result = { ...processed };
    if (dto.images) {
        result.images = transformProductImages(dto.images);
        result.imageMetadata = dto.images.map(image => ({
            url: image.url,
            width: image.width,
            height: image.height,
            altText: image.altText,
            position: image.position,
        }));
    }
    return result;
}
//# sourceMappingURL=dto-transformers.js.map