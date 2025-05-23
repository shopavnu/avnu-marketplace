"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessDto = preprocessDto;
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
//# sourceMappingURL=dto-entity-mapping.js.map