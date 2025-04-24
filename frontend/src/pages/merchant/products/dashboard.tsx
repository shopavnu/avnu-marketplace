import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  MagnifyingGlassIcon, 
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowsUpDownIcon,
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import VisibilityToggle from '@/components/merchant/products/VisibilityToggle';
import ProductMetricsCard from '@/components/merchant/products/ProductMetricsCard';

// Mock product data with metrics
const products = [
  {
    id: 'PROD-001',
    name: 'Organic Cotton T-Shirt',
    description: 'Sustainable and eco-friendly cotton t-shirt.',
    price: 29.99,
    inventory: 124,
    category: 'Apparel',
    status: 'Active',
    visible: true,
    image: null,
    featured: true,
    createdAt: '2025-03-15',
    metrics: {
      views: { value: 1245, change: 12.5, changeType: 'increase' as const },
      clicks: { value: 320, change: 8.2, changeType: 'increase' as const },
      conversions: { value: 28, change: 15.4, changeType: 'increase' as const },
      conversionRate: 8.75
    }
  },
  {
    id: 'PROD-002',
    name: 'Bamboo Water Bottle',
    description: 'Reusable water bottle made from sustainable bamboo.',
    price: 24.99,
    inventory: 89,
    category: 'Accessories',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-03-18',
    metrics: {
      views: { value: 980, change: 5.3, changeType: 'increase' as const },
      clicks: { value: 210, change: 3.1, changeType: 'decrease' as const },
      conversions: { value: 35, change: 2.8, changeType: 'increase' as const },
      conversionRate: 16.67
    }
  },
  {
    id: 'PROD-003',
    name: 'Recycled Denim Jacket',
    description: 'Stylish jacket made from recycled denim materials.',
    price: 79.99,
    inventory: 32,
    category: 'Apparel',
    status: 'Active',
    visible: true,
    image: null,
    featured: true,
    createdAt: '2025-03-20',
    metrics: {
      views: { value: 1560, change: 18.7, changeType: 'increase' as const },
      clicks: { value: 425, change: 22.4, changeType: 'increase' as const },
      conversions: { value: 28, change: 12.0, changeType: 'increase' as const },
      conversionRate: 6.59
    }
  },
  {
    id: 'PROD-004',
    name: 'Hemp Canvas Tote Bag',
    description: 'Durable tote bag made from sustainable hemp canvas.',
    price: 24.99,
    inventory: 156,
    category: 'Accessories',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-03-22',
    metrics: {
      views: { value: 720, change: 8.9, changeType: 'increase' as const },
      clicks: { value: 185, change: 4.2, changeType: 'increase' as const },
      conversions: { value: 42, change: 10.5, changeType: 'increase' as const },
      conversionRate: 22.70
    }
  },
  {
    id: 'PROD-005',
    name: 'Sustainable Yoga Mat',
    description: 'Eco-friendly yoga mat made from natural rubber.',
    price: 39.99,
    inventory: 67,
    category: 'Wellness',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-03-25',
    metrics: {
      views: { value: 850, change: 6.3, changeType: 'increase' as const },
      clicks: { value: 195, change: 2.1, changeType: 'decrease' as const },
      conversions: { value: 21, change: 5.0, changeType: 'increase' as const },
      conversionRate: 10.77
    }
  },
  {
    id: 'PROD-006',
    name: 'Recycled Plastic Sunglasses',
    description: 'Stylish sunglasses made from recycled ocean plastic.',
    price: 49.99,
    inventory: 42,
    category: 'Accessories',
    status: 'Draft',
    visible: false,
    image: null,
    featured: false,
    createdAt: '2025-03-28',
    metrics: {
      views: { value: 0, change: 0, changeType: 'increase' as const },
      clicks: { value: 0, change: 0, changeType: 'increase' as const },
      conversions: { value: 0, change: 0, changeType: 'increase' as const },
      conversionRate: 0
    }
  },
  {
    id: 'PROD-007',
    name: 'Organic Linen Dress',
    description: 'Elegant dress made from organic linen.',
    price: 89.99,
    inventory: 28,
    category: 'Apparel',
    status: 'Active',
    visible: true,
    image: null,
    featured: true,
    createdAt: '2025-04-01',
    metrics: {
      views: { value: 1120, change: 14.2, changeType: 'increase' as const },
      clicks: { value: 280, change: 9.8, changeType: 'increase' as const },
      conversions: { value: 14, change: 7.7, changeType: 'decrease' as const },
      conversionRate: 5.00
    }
  },
  {
    id: 'PROD-008',
    name: 'Biodegradable Phone Case',
    description: 'Phone case made from biodegradable materials.',
    price: 19.99,
    inventory: 95,
    category: 'Accessories',
    status: 'Active',
    visible: false,
    image: null,
    featured: false,
    createdAt: '2025-04-05',
    metrics: {
      views: { value: 640, change: 3.2, changeType: 'decrease' as const },
      clicks: { value: 145, change: 5.8, changeType: 'decrease' as const },
      conversions: { value: 18, change: 2.3, changeType: 'decrease' as const },
      conversionRate: 12.41
    }
  },
  {
    id: 'PROD-009',
    name: 'Recycled Paper Notebook',
    description: 'Notebook made from 100% recycled paper.',
    price: 12.99,
    inventory: 120,
    category: 'Stationery',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-04-08',
    metrics: {
      views: { value: 520, change: 7.8, changeType: 'increase' as const },
      clicks: { value: 110, change: 4.5, changeType: 'increase' as const },
      conversions: { value: 25, change: 10.2, changeType: 'increase' as const },
      conversionRate: 22.73
    }
  },
  {
    id: 'PROD-010',
    name: 'Sustainable Wooden Cutlery Set',
    description: 'Reusable wooden cutlery set for eco-friendly dining.',
    price: 15.99,
    inventory: 85,
    category: 'Home Goods',
    status: 'Active',
    visible: true,
    image: null,
    featured: false,
    createdAt: '2025-04-10',
    metrics: {
      views: { value: 480, change: 6.7, changeType: 'increase' as const },
      clicks: { value: 95, change: 3.9, changeType: 'increase' as const },
      conversions: { value: 22, change: 8.1, changeType: 'increase' as const },
      conversionRate: 23.16
    }
  }
];

const ProductDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [itemsPerPage] = useState(5);
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortOrder === 'asc' 
        ? a.price - b.price 
        : b.price - a.price;
    } else if (sortBy === 'views') {
      return sortOrder === 'asc' 
        ? a.metrics.views.value - b.metrics.views.value 
        : b.metrics.views.value - a.metrics.views.value;
    } else if (sortBy === 'conversions') {
      return sortOrder === 'asc' 
        ? a.metrics.conversions.value - b.metrics.conversions.value 
        : b.metrics.conversions.value - a.metrics.conversions.value;
    } else if (sortBy === 'conversionRate') {
      return sortOrder === 'asc' 
        ? a.metrics.conversionRate - b.metrics.conversionRate 
        : b.metrics.conversionRate - a.metrics.conversionRate;
    }
    return 0;
  });
  
  // Paginate products
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  
  // Handle visibility toggle
  const handleVisibilityToggle = (productId: string, isVisible: boolean) => {
    // In a real app, this would call an API to update the product visibility
    console.log(`Product ${productId} visibility changed to ${isVisible ? 'visible' : 'hidden'}`);
  };
  
  // Handle sort
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // Get the selected product for metrics display
  const getSelectedProductMetrics = () => {
    if (!selectedProduct) return null;
    return products.find(p => p.id === selectedProduct);
  };
  
  useEffect(() => {
    // Set the first product as selected by default
    if (currentProducts.length > 0 && !selectedProduct) {
      setSelectedProduct(currentProducts[0].id);
    }
  }, [currentProducts, selectedProduct]);

  return (
    <>
      <Head>
        <title>Product Dashboard | Merchant Portal | av|nu</title>
        <meta name="description" content="Manage your products and view performance metrics" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Product Dashboard</h1>
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
          
          {/* Search Bar */}
          <div className="mt-6 bg-white shadow rounded-lg p-4">
            <div className="relative flex-grow max-w-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sage focus:border-sage sm:text-sm"
                placeholder="Search products by name, ID, or category..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
          </div>
          
          {/* Product Metrics Card */}
          {selectedProduct && getSelectedProductMetrics() && (
            <div className="mt-6">
              <ProductMetricsCard
                productId={getSelectedProductMetrics()!.id}
                productName={getSelectedProductMetrics()!.name}
                views={getSelectedProductMetrics()!.metrics.views}
                clicks={getSelectedProductMetrics()!.metrics.clicks}
                conversions={getSelectedProductMetrics()!.metrics.conversions}
                conversionRate={getSelectedProductMetrics()!.metrics.conversionRate}
              />
            </div>
          )}
          
          {/* Products Table */}
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('views')}
                      >
                        Views
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('conversionRate')}
                      >
                        Conv. Rate
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
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
                  {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                      <tr 
                        key={product.id} 
                        className={`hover:bg-gray-50 ${selectedProduct === product.id ? 'bg-green-50' : ''}`}
                        onClick={() => setSelectedProduct(product.id)}
                      >
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
                          <div className="text-sm text-gray-500">
                            {product.inventory} in stock
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.category}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.metrics.views.value.toLocaleString()}</div>
                          <div className={`text-xs ${
                            product.metrics.views.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {product.metrics.views.changeType === 'increase' ? '+' : '-'}{product.metrics.views.change}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{product.metrics.conversionRate.toFixed(2)}%</div>
                          <div className="text-xs text-gray-500">
                            {product.metrics.conversions.value} sales
                          </div>
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
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(product.id);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <ChartBarIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Metrics</span>
                            </button>
                            <Link 
                              href={`/merchant/products/${product.id}`}
                              className="text-gray-400 hover:text-gray-500"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <EyeIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">View</span>
                            </Link>
                            <Link 
                              href={`/merchant/products/${product.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <PencilIcon className="h-5 w-5" aria-hidden="true" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={(e) => {
                                e.stopPropagation();
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
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        No products found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastItem, sortedProducts.length)}
                      </span>{' '}
                      of <span className="font-medium">{sortedProducts.length}</span> products
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handlePageChange(index + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === index + 1
                              ? 'z-10 bg-sage border-sage text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default ProductDashboard;
