import { Product as DataProduct } from '@/data/products';
import { Brand as DataBrand } from '@/data/brands';
import { Product as TypeProduct, ProductRating, Vendor, ShippingInfo } from '@/types/products';
import { Brand as TypeBrand } from '@/types/brand';

/**
 * Adapts a data product to a fully typed product
 */
export function adaptProduct(dataProduct: DataProduct): TypeProduct {
  return {
    ...dataProduct,
    images: [dataProduct.image],
    subCategory: '',
    attributes: {},
    isNew: Math.random() > 0.7, // Randomly assign some products as new
    rating: createDefaultRating(),
    vendor: createDefaultVendor(dataProduct.brand),
    inStock: true,
    createdAt: new Date().toISOString()
  };
}

/**
 * Adapts a data brand to a fully typed brand
 */
export function adaptBrand(dataBrand: DataBrand): TypeBrand {
  // Map common values to valid BrandCategory values
  const mapToBrandCategory = (value: string) => {
    const categoryMap: Record<string, TypeBrand['primaryCategory']> = {
      'sustainable': 'Wellness',
      'eco-friendly': 'Home Goods',
      'ethical-production': 'Apparel',
      'local-made': 'Accessories',
      'artisan': 'Art & Crafts',
      'fair-trade': 'Food & Beverage',
      'organic': 'Beauty',
      'cruelty-free': 'Beauty',
      'vegan': 'Food & Beverage',
      'innovative': 'Electronics',
      'tech-forward': 'Electronics',
      'handmade': 'Art & Crafts'
    };
    
    return categoryMap[value] || 'Accessories';
  };
  
  const primaryCat = mapToBrandCategory(dataBrand.values[0] || '');
  const secondaryCats = dataBrand.values.slice(1).map(mapToBrandCategory);
  
  return {
    ...dataBrand,
    categories: dataBrand.values,
    primaryCategory: primaryCat,
    secondaryCategories: secondaryCats,
    rating: 4.5 + (Math.random() * 0.5),
    isVerified: true,
    productCount: Math.floor(Math.random() * 50) + 10,
    joinedDate: new Date(2022, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
  };
}

/**
 * Creates a default product rating
 */
function createDefaultRating(): ProductRating {
  const average = 4 + Math.random();
  const count = Math.floor(Math.random() * 100) + 5;
  
  return {
    avnuRating: {
      average: Math.min(5, average),
      count
    }
  };
}

/**
 * Creates a default vendor from a brand name
 */
function createDefaultVendor(brandName: string): Vendor {
  return {
    id: brandName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: brandName,
    causes: ['sustainability', 'ethical-production'],
    isLocal: true,
    shippingInfo: createDefaultShippingInfo()
  };
}

/**
 * Creates default shipping info
 */
function createDefaultShippingInfo(): ShippingInfo {
  return {
    isFree: Math.random() > 0.5,
    minimumForFree: 75,
    baseRate: 5.99
  };
}
