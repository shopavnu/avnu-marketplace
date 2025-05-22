'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.getBrandName = getBrandName;
exports.getCategories = getCategories;
exports.getPrimaryImage = getPrimaryImage;
exports.getPrice = getPrice;
exports.getTitle = getTitle;
exports.getDescription = getDescription;
exports.getInStockStatus = getInStockStatus;
exports.getOnSaleStatus = getOnSaleStatus;
exports.getDiscountPercentage = getDiscountPercentage;
exports.getCompareAtPrice = getCompareAtPrice;
function getBrandName(product) {
  if (!product) {
    return '';
  }
  if ('brandName' in product && typeof product['brandName'] === 'string') {
    return product['brandName'];
  }
  if (product.brandInfo && typeof product.brandInfo === 'string') {
    return product.brandInfo;
  }
  if (
    product.brandInfo &&
    typeof product.brandInfo === 'object' &&
    'name' in product.brandInfo &&
    typeof product.brandInfo.name === 'string'
  ) {
    return product.brandInfo.name;
  }
  if (
    product.brandInfo &&
    typeof product.brandInfo === 'object' &&
    'id' in product.brandInfo &&
    typeof product.brandInfo.id === 'string'
  ) {
    return product.brandInfo.id;
  }
  return '';
}
function getCategories(product) {
  if (!product || !product.categories) {
    return [];
  }
  if (
    Array.isArray(product.categories) &&
    product.categories.every(cat => typeof cat === 'string')
  ) {
    return product.categories;
  }
  if (
    Array.isArray(product.categories) &&
    product.categories.some(cat => typeof cat === 'object')
  ) {
    return product.categories
      .map(cat => {
        if (typeof cat === 'string') return cat;
        if (typeof cat === 'object' && cat && 'name' in cat) {
          return cat.name;
        }
        return null;
      })
      .filter(cat => cat !== null);
  }
  return [];
}
function getPrimaryImage(product) {
  if (
    !product ||
    !product.images ||
    !Array.isArray(product.images) ||
    product.images.length === 0
  ) {
    return '';
  }
  return product.images[0];
}
function getPrice(product) {
  if (!product) {
    return 0;
  }
  if (typeof product.price === 'number') {
    return product.price;
  }
  if (typeof product.price === 'string') {
    const parsed = parseFloat(product.price);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
function getTitle(product) {
  if (!product) {
    return '';
  }
  return typeof product.title === 'string' ? product.title : '';
}
function getDescription(product) {
  if (!product) {
    return '';
  }
  return typeof product.description === 'string' ? product.description : '';
}
function getInStockStatus(product) {
  if (!product) {
    return false;
  }
  return product.inStock === true;
}
function getOnSaleStatus(product) {
  if (!product) {
    return false;
  }
  return product.isOnSale === true;
}
function getDiscountPercentage(product) {
  if (!product) {
    return 0;
  }
  if (typeof product.discountPercentage === 'number') {
    return product.discountPercentage;
  }
  if (typeof product.discountPercentage === 'string') {
    const parsed = parseFloat(product.discountPercentage);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (product.price !== undefined && product.compareAtPrice !== undefined) {
    const price = getPrice(product);
    const compareAtPrice = getCompareAtPrice(product);
    if (compareAtPrice > 0 && price < compareAtPrice) {
      return Math.round((1 - price / compareAtPrice) * 100);
    }
  }
  return 0;
}
function getCompareAtPrice(product) {
  if (!product) {
    return 0;
  }
  if (typeof product.compareAtPrice === 'number') {
    return product.compareAtPrice;
  }
  if (typeof product.compareAtPrice === 'string') {
    const parsed = parseFloat(product.compareAtPrice);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
//# sourceMappingURL=product-schema.js.map
