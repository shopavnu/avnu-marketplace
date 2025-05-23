"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformDto = transformDto;
exports.objectArrayToPrimitiveArray = objectArrayToPrimitiveArray;
function transformDto(dto, config) {
    const result = { ...dto };
    if (config.jsonFields) {
        for (const [property, jsonField] of Object.entries(config.jsonFields)) {
            if (result[property] !== undefined) {
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
    }
    if (config.transform) {
        for (const [property, transform] of Object.entries(config.transform)) {
            if (result[property] !== undefined) {
                const targetObj = getOrCreateNestedObject(result, transform.targetPath);
                const lastKey = transform.targetPath[transform.targetPath.length - 1];
                targetObj[lastKey] = transform.transformer(result[property]);
                if (transform.targetPath.length === 0 ||
                    transform.targetPath[transform.targetPath.length - 1] !== property) {
                    delete result[property];
                }
            }
        }
    }
    if (config.customTransformers) {
        for (const [property, transformer] of Object.entries(config.customTransformers)) {
            if (result[property] !== undefined) {
                result[property] = transformer(result[property], result);
            }
        }
    }
    return result;
}
function getOrCreateNestedObject(obj, path) {
    if (path.length === 0)
        return obj;
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!current[key]) {
            current[key] = {};
        }
        current = current[key];
    }
    return current;
}
function objectArrayToPrimitiveArray(arr, property) {
    if (!arr || !Array.isArray(arr))
        return [];
    return arr.map(item => item[property]);
}
//# sourceMappingURL=dto-transformers.js.map