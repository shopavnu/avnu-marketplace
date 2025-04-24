import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import BulkOperationsToolbar from '@/components/merchant/products/BulkOperationsToolbar';
import BulkCategoryAssignment from '@/components/merchant/products/BulkCategoryAssignment';
import BulkVisibilityToggle from '@/components/merchant/products/BulkVisibilityToggle';
import VisibilityToggle from '@/components/merchant/products/VisibilityToggle';

// Mock product data
const products = [
  {
    id: 'PROD-001',
    name: 'Organic Cotton T-Shirt',
    description: 'Sustainable and eco-friendly cotton t-shirt.',
    price: 29.99,
    inventory: 124,
    category: 'Apparel',
    categoryId: 'cat-1',
    status: 'Active',
    visible: true,
    image: null,
    featured: true,
    createdAt: '2025-03-15'
  },
  {
    id: 'PROD-002',
    name: 'Bamboo Water Bottle',
    description: 'Reusable water bottle made from sustainable bamboo.',
    price: 24.99,
    inventory: 89,
    category: 'Accessories',
    categoryId: 'cat-2',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-03-18'
  },
  {
    id: 'PROD-003',
    name: 'Recycled Denim Jacket',
    description: 'Stylish jacket made from recycled denim materials.',
    price: 79.99,
    inventory: 32,
    category: 'Apparel',
    categoryId: 'cat-1',
    status: 'Active',
    visible: true,
    image: null,
    featured: true,
    createdAt: '2025-03-20'
  },
  {
    id: 'PROD-004',
    name: 'Hemp Canvas Tote Bag',
    description: 'Durable tote bag made from sustainable hemp canvas.',
    price: 24.99,
    inventory: 156,
    category: 'Accessories',
    categoryId: 'cat-2',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-03-22'
  },
  {
    id: 'PROD-005',
    name: 'Sustainable Yoga Mat',
    description: 'Eco-friendly yoga mat made from natural rubber.',
    price: 39.99,
    inventory: 67,
    category: 'Wellness',
    categoryId: 'cat-5',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-03-25'
  },
  {
    id: 'PROD-006',
    name: 'Recycled Plastic Sunglasses',
    description: 'Stylish sunglasses made from recycled ocean plastic.',
    price: 49.99,
    inventory: 42,
    category: 'Accessories',
    categoryId: 'cat-2',
    status: 'Draft',
    visible: false,
    image: null,
    featured: false,
    createdAt: '2025-03-28'
  },
  {
    id: 'PROD-007',
    name: 'Organic Linen Dress',
    description: 'Elegant dress made from organic linen.',
    price: 89.99,
    inventory: 28,
    category: 'Apparel',
    categoryId: 'cat-1',
    status: 'Active',
    visible: true,
    image: null,
    featured: true,
    createdAt: '2025-04-01'
  },
  {
    id: 'PROD-008',
    name: 'Biodegradable Phone Case',
    description: 'Phone case made from biodegradable materials.',
    price: 19.99,
    inventory: 95,
    category: 'Accessories',
    categoryId: 'cat-2',
    status: 'Active',
    visible: false,
    image: null,
    featured: false,
    createdAt: '2025-04-05'
  },
  {
    id: 'PROD-009',
    name: 'Recycled Paper Notebook',
    description: 'Notebook made from 100% recycled paper.',
    price: 12.99,
    inventory: 120,
    category: 'Stationery',
    categoryId: 'cat-9',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-04-08'
  },
  {
    id: 'PROD-010',
    name: 'Sustainable Wooden Cutlery Set',
    description: 'Reusable wooden cutlery set for eco-friendly dining.',
    price: 15.99,
    inventory: 85,
    category: 'Home Goods',
    categoryId: 'cat-3',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-04-10'
  }
];

const BulkManageProductsPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [localProducts, setLocalProducts] = useState([...products]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showVisibilityModal, setShowVisibilityModal] = useState(false);
  
  // Available categories for filtering
  const categories = ['All', 'Apparel', 'Accessories', 'Wellness', 'Home Goods', 'Beauty', 'Stationery'];
  
  // Available statuses for filtering
  const statuses = ['All', 'Active', 'Draft', 'Out of Stock'];

  // Filter and sort products
  const filteredProducts = localProducts
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || product.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        return sortOrder === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else if (sortBy === 'price') {
        return sortOrder === 'asc' 
          ? a.price - b.price 
          : b.price - a.price;
      } else if (sortBy === 'inventory') {
        return sortOrder === 'asc' 
          ? a.inventory - b.inventory 
          : b.inventory - a.inventory;
      } else if (sortBy === 'createdAt') {
        return sortOrder === 'asc' 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    if (e.target.checked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  const handleVisibilityToggle = async (productId: string, isVisible: boolean) => {
    // In a real app, this would call an API to update the product visibility
    console.log(`Product ${productId} visibility changed to ${isVisible ? 'visible' : 'hidden'}`);
    
    // Update local state
    setLocalProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId 
          ? { ...product, visible: isVisible } 
          : product
      )
    );
  };
  
  // Bulk operations handlers
  const handleBulkToggleVisibility = async (productIds: string[], visible: boolean) => {
    // In a real app, this would call an API to update multiple products
    console.log(`Toggling visibility to ${visible ? 'visible' : 'hidden'} for products:`, productIds);
    
    // Update local state
    setLocalProducts(prevProducts => 
      prevProducts.map(product => 
        productIds.includes(product.id) 
          ? { ...product, visible: visible } 
          : product
      )
    );
    
    // Show success message
    setSuccessMessage(`Successfully ${visible ? 'showed' : 'hid'} ${productIds.length} products`);
    setTimeout(() => setSuccessMessage(null), 3000);
    
    return Promise.resolve();
  };
  
  const handleBulkAssignCategory = async (productIds: string[], categoryId: string) => {
    // Get category name from ID
    const categoryMap: Record<string, string> = {
      'cat-1': 'Apparel',
      'cat-2': 'Accessories',
      'cat-3': 'Home Goods',
      'cat-4': 'Beauty',
      'cat-5': 'Wellness',
      'cat-6': 'Food & Drink',
      'cat-7': 'Art',
      'cat-8': 'Jewelry',
      'cat-9': 'Stationery'
    };
    
    const categoryName = categoryMap[categoryId] || 'Unknown';
    
    // In a real app, this would call an API to update multiple products
    console.log(`Assigning category ${categoryName} (${categoryId}) to products:`, productIds);
    
    // Update local state
    setLocalProducts(prevProducts => 
      prevProducts.map(product => 
        productIds.includes(product.id) 
          ? { ...product, category: categoryName, categoryId: categoryId } 
          : product
      )
    );
    
    // Show success message
    setSuccessMessage(`Successfully assigned ${productIds.length} products to ${categoryName}`);
    setTimeout(() => setSuccessMessage(null), 3000);
    
    return Promise.resolve();
  };
  
  const handleClearSelection = () => {
    setSelectedProducts([]);
  };

  return (
    <>
      <Head>
        <title>Bulk Manage Products | Merchant Portal | av|nu</title>
        <meta name="description" content="Bulk manage your products on av|nu marketplace" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Bulk Manage Products</h1>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/merchant/products/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Add Product
              </Link>
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Search and Filters */}
          <div className="mt-6 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sage focus:border-sage sm:text-sm"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <AdjustmentsHorizontalIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
                  Filters
                  <ChevronDownIcon className="ml-2 h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            
            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700">
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    name="sortBy"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setSortOrder('asc');
                    }}
                  >
                    <option value="name">Name</option>
                    <option value="price">Price</option>
                    <option value="inventory">Inventory</option>
                    <option value="createdAt">Date Added</option>
                  </select>
                </div>
              </div>
            )}
          </div>
          
          {/* Selected Count */}
          {selectedProducts.length > 0 && (
            <div className="mt-4 bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">{selectedProducts.length}</span> product{selectedProducts.length !== 1 ? 's' : ''} selected
              </p>
            </div>
          )}
          
          {/* Products Table */}
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                          checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                          onChange={handleSelectAll}
                        />
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('name')}
                      >
                        Product
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('price')}
                      >
                        Price
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('inventory')}
                      >
                        Inventory
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visibility
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <tr key={product.id} className={`hover:bg-gray-50 ${selectedProducts.includes(product.id) ? 'bg-green-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                              checked={selectedProducts.includes(product.id)}
                              onChange={(e) => handleSelectProduct(e, product.id)}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 mr-3">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">No img</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-500">{product.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.inventory}</div>
                          {product.inventory < 10 && (
                            <div className="text-xs text-red-500">Low stock</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : product.status === 'Draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.status}
                          </span>
                          {product.featured && (
                            <span className="ml-2 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <VisibilityToggle
                            productId={product.id}
                            initialState={product.visible}
                            onToggle={handleVisibilityToggle}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link 
                              href={`/merchant/products/${product.id}`}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">View</span>
                            </Link>
                            <Link 
                              href={`/merchant/products/${product.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => {
                                // In a real app, this would call an API to delete the product
                                alert(`Deleting product: ${product.id}`);
                              }}
                            >
                              <TrashIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-500">
                        No products found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Bulk Operations Toolbar */}
          <BulkOperationsToolbar
            selectedProductIds={selectedProducts}
            onToggleVisibility={() => setShowVisibilityModal(true)}
            onAssignCategory={() => setShowCategoryModal(true)}
            onClearSelection={handleClearSelection}
          />
          
          {/* Bulk Category Assignment Modal */}
          <BulkCategoryAssignment
            selectedProductIds={selectedProducts}
            onAssign={handleBulkAssignCategory}
            onCancel={() => setShowCategoryModal(false)}
            isOpen={showCategoryModal}
          />
          
          {/* Bulk Visibility Toggle Modal */}
          <BulkVisibilityToggle
            selectedProductIds={selectedProducts}
            onToggleVisibility={handleBulkToggleVisibility}
            onCancel={() => setShowVisibilityModal(false)}
            isOpen={showVisibilityModal}
          />
        </div>
      </MerchantLayout>
    </>
  );
};

export default BulkManageProductsPage;
