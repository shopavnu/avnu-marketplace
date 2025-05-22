'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.toNumericId = toNumericId;
exports.toStringId = toStringId;
exports.safeToNumericId = safeToNumericId;
exports.safeToStringId = safeToStringId;
exports.createNumericIdWhereClause = createNumericIdWhereClause;
exports.createStringIdWhereClause = createStringIdWhereClause;
function toNumericId(id) {
  if (!id) {
    throw new Error('ID is required');
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error(`Invalid ID: ${id} is not a valid number`);
  }
  return numericId;
}
function toStringId(id) {
  return id.toString();
}
function safeToNumericId(id) {
  if (!id) {
    return undefined;
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    return undefined;
  }
  return numericId;
}
function safeToStringId(id) {
  if (id === undefined || id === null) {
    return undefined;
  }
  return id.toString();
}
function createNumericIdWhereClause(id) {
  return { id: toNumericId(id) };
}
function createStringIdWhereClause(fieldName, id) {
  return { [fieldName]: id };
}
//# sourceMappingURL=id-conversion.util.js.map
