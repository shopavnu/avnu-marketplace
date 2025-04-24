import { useState, useEffect } from 'react';
import { TagIcon, XMarkIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string | null;
}

interface BulkCategoryAssignmentProps {
  selectedProductIds: string[];
  onAssign: (productIds: string[], categoryId: string) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const BulkCategoryAssignment = ({
  selectedProductIds,
  onAssign,
  onCancel,
  isOpen
}: BulkCategoryAssignmentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Mock categories - in a real app, these would come from an API
  useEffect(() => {
    // Simulate API call to fetch categories
    const fetchCategories = async () => {
      // This would be an API call in a real application
      const mockCategories: Category[] = [
        { id: 'cat-1', name: 'Apparel', description: 'Clothing and wearable items' },
        { id: 'cat-2', name: 'Accessories', description: 'Bags, jewelry, and other accessories' },
        { id: 'cat-3', name: 'Home Goods', description: 'Items for the home' },
        { id: 'cat-4', name: 'Beauty', description: 'Skincare, makeup, and beauty products' },
        { id: 'cat-5', name: 'Wellness', description: 'Health and wellness products' },
        { id: 'cat-6', name: 'Food & Drink', description: 'Consumable items' },
        { id: 'cat-7', name: 'Art', description: 'Artwork and creative pieces' },
        { id: 'cat-8', name: 'Jewelry', description: 'Necklaces, rings, and other jewelry', parentId: 'cat-2' },
        { id: 'cat-9', name: 'Stationery', description: 'Paper goods and writing supplies' },
        { id: 'cat-10', name: 'Tech', description: 'Technology and gadgets' },
        { id: 'cat-11', name: 'Pets', description: 'Items for pets' },
        { id: 'cat-12', name: 'Kids', description: 'Products for children' },
        { id: 'cat-13', name: 'Vintage', description: 'Vintage and antique items' },
        { id: 'cat-14', name: 'Books', description: 'Books and publications' },
        { id: 'cat-15', name: 'Plants', description: 'Plants and gardening supplies' }
      ];
      
      setCategories(mockCategories);
      setFilteredCategories(mockCategories);
    };
    
    fetchCategories();
  }, []);
  
  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);
  
  // Handle category selection
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };
  
  // Handle assignment submission
  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      setError('Please select a category');
      return;
    }
    
    if (selectedProductIds.length === 0) {
      setError('No products selected');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await onAssign(selectedProductIds, selectedCategoryId);
      // Reset form
      setSelectedCategoryId('');
      setSearchTerm('');
    } catch (err: unknown) {
      setError('Failed to assign category to products');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Assign Category to Products</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onCancel}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="px-6 py-4 border-b border-gray-200">
          <p className="text-sm text-gray-500">
            Assigning a category to <span className="font-medium">{selectedProductIds.length}</span> product{selectedProductIds.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="px-6 py-4 flex-1 overflow-y-auto">
          {/* Search input */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search Categories
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Categories list */}
          <div className="space-y-2 mt-4">
            <h4 className="text-sm font-medium text-gray-700">Select a Category</h4>
            
            {filteredCategories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    className={`border rounded-md p-3 cursor-pointer transition-colors ${
                      selectedCategoryId === category.id
                        ? 'border-sage bg-sage-50 ring-2 ring-sage'
                        : 'border-gray-200 hover:border-sage hover:bg-gray-50'
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full ${
                        selectedCategoryId === category.id ? 'bg-sage text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <TagIcon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium text-gray-900">{category.name}</h5>
                        {category.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{category.description}</p>
                        )}
                        {category.parentId && (
                          <p className="text-xs text-gray-400 mt-1">
                            Subcategory of {categories.find(c => c.id === category.parentId)?.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No categories found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
        
        {error && (
          <div className="px-6 py-2 bg-red-50">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
            onClick={handleSubmit}
            disabled={isLoading || !selectedCategoryId}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="animate-spin -ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Assigning...
              </>
            ) : (
              <>
                <CheckIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Assign Category
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkCategoryAssignment;
