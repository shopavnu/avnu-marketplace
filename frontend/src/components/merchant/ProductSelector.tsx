import { FC } from 'react';
import { TagIcon } from '@heroicons/react/24/outline';
import { Product } from '@/types/adCampaigns';

interface ProductSelectorProps {
  products: Product[];
  selectedProductIds: string[];
  onProductSelect: (productId: string) => void;
  loading?: boolean;
}

const ProductSelector: FC<ProductSelectorProps> = ({
  products,
  selectedProductIds,
  onProductSelect,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="border rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-md"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-6">
        <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
        <p className="mt-1 text-sm text-gray-500">
          You don't have any products available for campaigns.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product: Product) => (
        <div 
          key={product.id}
          className={`border rounded-lg p-4 cursor-pointer transition-all ${
            selectedProductIds.includes(product.id) 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => onProductSelect(product.id)}
        >
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <TagIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{product.name}</h3>
              <p className="text-gray-500">${product.price.toFixed(2)}</p>
            </div>
            <div className="flex-shrink-0">
              <input 
                type="checkbox" 
                checked={selectedProductIds.includes(product.id)} 
                onChange={() => onProductSelect(product.id)}
                className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSelector;
