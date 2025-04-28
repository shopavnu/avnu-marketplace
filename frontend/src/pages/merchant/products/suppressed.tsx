import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  ExclamationTriangleIcon,
  PencilIcon, 
  EyeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  FunnelIcon,
  XCircleIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import SuppressedProductsBulkActions from '@/components/merchant/SuppressedProductsBulkActions';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { ProductService } from '@/services/product.service';
import { Product } from '@/types/product';

// Mock merchant ID - in a real app, this would come from authentication
const MOCK_MERCHANT_ID = 'MERCH-001';

const SuppressedProductsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedIssueType, setSelectedIssueType] = useState('All');
  const [expandedProducts, setExpandedProducts] = useState<Record<string, boolean>>({});
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [revalidationStatus, setRevalidationStatus] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({});

  // Issue types for filtering
  const issueTypes = [
    'All', 
    'Missing images', 
    'Missing title', 
    'Missing price', 
    'Missing description',
    'Missing brand name'
  ];

  // Fetch suppressed products
  useEffect(() => {
    const fetchSuppressedProducts = async () => {
      setLoading(true);
      try {
        // For now, use mock data since the API endpoint might not be ready
        // In production, this would use: await ProductService.getSuppressedProducts(MOCK_MERCHANT_ID);
        const mockData: Product[] = [
          {
            id: 'prod-001',
            title: 'Organic Cotton T-Shirt',
            description: 'Made with 100% organic cotton for ultimate comfort.',
            price: 29.99,
            images: ['/images/products/tshirt-1.jpg'],
            categories: ['Clothing', 'T-Shirts'],
            merchantId: MOCK_MERCHANT_ID,
            brandName: '',  // Missing brand name - reason for suppression
            isSuppressed: true,
            suppressedFrom: ['search results', 'recommendations'],
            lastValidationDate: '2025-03-15T10:30:00Z'
          },
          {
            id: 'prod-002',
            title: 'Bamboo Yoga Mat',
            description: '',  // Missing description - reason for suppression
            price: 49.99,
            images: ['/images/products/yoga-mat-1.jpg'],
            categories: ['Fitness', 'Yoga'],
            merchantId: MOCK_MERCHANT_ID,
            brandName: 'Eco Fitness',
            isSuppressed: true,
            suppressedFrom: ['search results', 'trending products'],
            lastValidationDate: '2025-03-20T14:15:00Z'
          },
          {
            id: 'prod-003',
            title: '',  // Missing title - reason for suppression
            description: 'Handcrafted ceramic mug for your morning coffee.',
            price: 19.99,
            images: ['/images/products/mug-1.jpg'],
            categories: ['Home', 'Kitchen'],
            merchantId: MOCK_MERCHANT_ID,
            brandName: 'Home Essentials',
            isSuppressed: true,
            suppressedFrom: ['search results', 'recommendations', 'category pages'],
            lastValidationDate: '2025-03-25T09:45:00Z'
          }
        ];
        
        setProducts(mockData);
        // Reset selected products when fetching new data
        setSelectedProducts([]);
      } catch (error) {
        console.error('Error fetching suppressed products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuppressedProducts();
  }, []);

  // Filter products by issue type
  const filteredProducts = selectedIssueType === 'All' 
    ? products 
    : products.filter(product => 
        product.suppressedFrom && 
        product.suppressedFrom.some(issue => issue.includes(selectedIssueType.toLowerCase()))
      );

  // Toggle product details expansion
  const toggleProductExpansion = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };
  
  // Toggle product selection for bulk actions
  const toggleProductSelection = (product: Product) => {
    setSelectedProducts(prev => {
      const isSelected = prev.some(p => p.id === product.id);
      if (isSelected) {
        return prev.filter(p => p.id !== product.id);
      } else {
        return [...prev, product];
      }
    });
  };
  
  // Handle bulk selection of all visible products
  const toggleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      // If all are selected, deselect all
      setSelectedProducts([]);
    } else {
      // Otherwise, select all visible products
      setSelectedProducts([...filteredProducts]);
    }
  };
  
  // Handle revalidation of a single product
  const handleRevalidateProduct = async (productId: string) => {
    setRevalidationStatus(prev => ({ ...prev, [productId]: 'loading' }));
    try {
      // In a real app, this would call the API endpoint
      // await ProductService.unsuppressProduct(MOCK_MERCHANT_ID, productId);
      console.log(`Revalidating product ${productId}...`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRevalidationStatus(prev => ({ ...prev, [productId]: 'success' }));
      // After successful revalidation, we'd refetch the products
      // For now, we'll just simulate by removing the product after a delay
      setTimeout(() => {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }, 2000);
    } catch (error) {
      console.error(`Error revalidating product ${productId}:`, error);
      setRevalidationStatus(prev => ({ ...prev, [productId]: 'error' }));
    }
  };
  
  // Handle bulk revalidation
  const handleBulkRevalidate = async (productIds: string[]) => {
    try {
      // In a real app, this would call the API endpoint
      // await ProductService.bulkUnsuppressProducts(MOCK_MERCHANT_ID, productIds);
      console.log(`Bulk revalidating products: ${productIds.join(', ')}`);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // After successful revalidation, we'd refetch the products
      // For now, we'll just simulate by removing the products after a delay
      setTimeout(() => {
        setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
      }, 1000);
      return true;
    } catch (error) {
      console.error('Error bulk revalidating products:', error);
      return false;
    }
  };
  
  // Handle bulk edit
  const handleBulkEdit = (productIds: string[]) => {
    // In a real app, this would navigate to a bulk edit page
    console.log(`Navigating to bulk edit for ${productIds.length} products...`);
    alert(`Bulk editing ${productIds.length} products (would navigate to bulk edit page)`);
  };

  // Get issue details for a product
  const getIssueDetails = (product: Product) => {
    const issues = [];
    
    if (!product.images || product.images.length === 0) {
      issues.push('Missing product images');
    }
    
    if (!product.title || product.title.trim() === '') {
      issues.push('Missing product title');
    }
    
    if (product.price === undefined || product.price === null) {
      issues.push('Missing product price');
    }
    
    if (!product.description || product.description.trim() === '') {
      issues.push('Missing product description');
    }
    
    if (!product.brandName || product.brandName.trim() === '') {
      issues.push('Missing brand name');
    }
    
    return issues;
  };

  // Get suppression locations for a product
  const getSuppressionLocations = (product: Product) => {
    return product.suppressedFrom || [];
  };

  return (
    <>
      <Head>
        <title>Suppressed Products | Merchant Dashboard | av|nu</title>
        <meta name="description" content="Manage suppressed products on av|nu marketplace" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Suppressed Products</h1>
              <p className="mt-2 text-sm text-gray-700">
                Products with missing or invalid data that are hidden from customers
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                type="button"
                onClick={() => router.reload()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
          
          {/* Alert Banner */}
          <div className="mt-6 rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Attention Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    These products are hidden from customers because they're missing key information. 
                    Fix the issues to make them visible in the marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Filters */}
          <div className="mt-6 bg-white shadow rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filter by issue:</span>
              </div>
              <div className="relative">
                <select
                  id="issue-type"
                  name="issue-type"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm rounded-md"
                  value={selectedIssueType}
                  onChange={(e) => setSelectedIssueType(e.target.value)}
                >
                  {issueTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDownIcon className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Products List */}
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="py-12 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage"></div>
              </div>
            ) : filteredProducts.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {/* Table Header */}
                <li className="bg-gray-50 px-4 py-3 sm:px-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                        checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                        onChange={toggleSelectAll}
                      />
                      <span className="ml-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select All
                      </span>
                    </div>
                    <div className="ml-4 flex-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </span>
                    </div>
                  </div>
                </li>

                {filteredProducts.map((product) => {
                  const isExpanded = expandedProducts[product.id] || false;
                  const isSelected = selectedProducts.some(p => p.id === product.id);
                  const issues = getIssueDetails(product);
                  const suppressionLocations = getSuppressionLocations(product);
                  const revalidationState = revalidationStatus[product.id] || 'idle';
                  
                  return (
                    <li key={product.id} className={isSelected ? 'bg-sage-50' : ''}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                                checked={isSelected}
                                onChange={() => toggleProductSelection(product)}
                              />
                            </div>
                            <div className="flex-shrink-0 ml-4 h-16 w-16 relative bg-gray-100 rounded-md overflow-hidden">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.title || 'Product image'}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <XCircleIcon className="h-8 w-8 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-medium text-gray-900 truncate max-w-md">
                                {product.title || <span className="text-red-500 italic">Missing title</span>}
                              </h3>
                              <div className="mt-1 flex items-center">
                                <span className="text-sm text-gray-500">
                                  ID: {product.id}
                                </span>
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                                  Suppressed
                                </span>
                              </div>
                              <div className="mt-2">
                                {issues.map((issue, index) => (
                                  <span 
                                    key={index} 
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2 mb-1"
                                  >
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleRevalidateProduct(product.id)}
                              disabled={revalidationState === 'loading'}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {revalidationState === 'loading' ? (
                                <ArrowPathIcon className="h-4 w-4 animate-spin" />
                              ) : revalidationState === 'success' ? (
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              ) : (
                                <ArrowPathIcon className="h-4 w-4" />
                              )}
                              <span className="sr-only">Revalidate</span>
                            </button>
                            <Link 
                              href={`/merchant/products/${product.id}`}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                            >
                              <EyeIcon className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Link>
                            <Link 
                              href={`/merchant/products/${product.id}/edit`}
                              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <button
                              type="button"
                              onClick={() => toggleProductExpansion(product.id)}
                              className="inline-flex items-center p-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                            >
                              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              <span className="sr-only">Toggle details</span>
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="mt-4 border-t border-gray-200 pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Product Details</h4>
                                <dl className="mt-2 text-sm text-gray-500">
                                  <div className="flex justify-between py-1">
                                    <dt>Price:</dt>
                                    <dd className="text-gray-900">
                                      {product.price !== undefined && product.price !== null 
                                        ? `$${product.price.toFixed(2)}` 
                                        : <span className="text-red-500 italic">Missing</span>}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <dt>Brand:</dt>
                                    <dd className="text-gray-900">
                                      {product.brandName || <span className="text-red-500 italic">Missing</span>}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <dt>Categories:</dt>
                                    <dd className="text-gray-900">
                                      {product.categories && product.categories.length > 0 
                                        ? product.categories.join(', ') 
                                        : <span className="text-red-500 italic">Missing</span>}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between py-1">
                                    <dt>Last Validated:</dt>
                                    <dd className="text-gray-900">
                                      {product.lastValidationDate 
                                        ? new Date(product.lastValidationDate).toLocaleString() 
                                        : 'Never'}
                                    </dd>
                                  </div>
                                </dl>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Suppression Details</h4>
                                <div className="mt-2">
                                  <p className="text-sm text-gray-500 mb-2">
                                    This product is hidden from:
                                  </p>
                                  <ul className="list-disc pl-5 text-sm text-gray-500">
                                    {suppressionLocations.map((location, index) => (
                                      <li key={index} className="py-0.5 capitalize">
                                        {location}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900">Description</h4>
                              <div className="mt-2 text-sm text-gray-500 border border-gray-200 rounded-md p-3 bg-gray-50">
                                {product.description 
                                  ? product.description 
                                  : <span className="text-red-500 italic">Missing description</span>}
                              </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                              <Link
                                href={`/merchant/products/${product.id}/edit`}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                              >
                                Fix Issues
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="py-12 text-center">
                <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No suppressed products</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedIssueType !== 'All' 
                    ? `No products found with the issue: ${selectedIssueType}` 
                    : 'All your products are properly configured and visible to customers.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </MerchantLayout>
      
      {/* Bulk Actions Component */}
      <SuppressedProductsBulkActions
        selectedProducts={selectedProducts}
        onRevalidate={handleBulkRevalidate}
        onBulkEdit={handleBulkEdit}
        onClearSelection={() => setSelectedProducts([])}
      />
    </>
  );
};

export default SuppressedProductsPage;
