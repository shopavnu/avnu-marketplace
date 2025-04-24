import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  TagIcon,
  TruckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import ProductPerformanceMetrics from '@/components/merchant/products/ProductPerformanceMetrics';
import ProductMetadataEditor from '@/components/merchant/products/ProductMetadataEditor';
import ShippingConfiguration from '@/components/merchant/products/ShippingConfiguration';

// Mock product data
const mockProduct = {
  id: 'PROD-003',
  name: 'Recycled Denim Jacket',
  description: 'Stylish jacket made from recycled denim materials. Eco-friendly and sustainable fashion choice for the conscious consumer. Features multiple pockets and adjustable cuffs.',
  price: 79.99,
  compareAtPrice: 99.99,
  sku: 'RDJ-001-M',
  barcode: '123456789012',
  inventory: 32,
  weight: 0.8,
  dimensions: {
    length: 60,
    width: 45,
    height: 5
  },
  category: 'Apparel',
  subcategory: 'Jackets',
  tags: ['sustainable', 'recycled', 'denim', 'eco-friendly'],
  status: 'Active',
  visible: true,
  featured: true,
  createdAt: '2025-03-20',
  updatedAt: '2025-04-15',
  images: [],
  options: [
    {
      name: 'Size',
      values: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      name: 'Color',
      values: ['Blue', 'Light Blue', 'Dark Blue']
    }
  ],
  variants: [
    {
      id: 'VAR-001',
      sku: 'RDJ-001-S-BLUE',
      price: 79.99,
      inventory: 8,
      options: {
        Size: 'S',
        Color: 'Blue'
      }
    },
    {
      id: 'VAR-002',
      sku: 'RDJ-001-M-BLUE',
      price: 79.99,
      inventory: 12,
      options: {
        Size: 'M',
        Color: 'Blue'
      }
    },
    {
      id: 'VAR-003',
      sku: 'RDJ-001-L-BLUE',
      price: 79.99,
      inventory: 6,
      options: {
        Size: 'L',
        Color: 'Blue'
      }
    },
    {
      id: 'VAR-004',
      sku: 'RDJ-001-M-DARK',
      price: 79.99,
      inventory: 6,
      options: {
        Size: 'M',
        Color: 'Dark Blue'
      }
    }
  ]
};

// Mock metadata
const mockMetadata = {
  metaTitle: 'Recycled Denim Jacket | Sustainable Fashion | av|nu',
  metaDescription: 'Shop our eco-friendly Recycled Denim Jacket made from sustainable materials. Stylish, comfortable, and good for the planet. Free shipping available.',
  urlSlug: 'recycled-denim-jacket',
  keywords: ['sustainable jacket', 'recycled denim', 'eco-friendly fashion', 'ethical clothing'],
  customAttributes: [
    { key: 'Material', value: '85% Recycled Denim, 15% Organic Cotton' },
    { key: 'Care Instructions', value: 'Machine wash cold, tumble dry low' },
    { key: 'Country of Origin', value: 'USA' }
  ],
  relatedProducts: ['PROD-001', 'PROD-007', 'PROD-008']
};

// Mock shipping configuration
const mockShippingConfig = {
  freeShippingThreshold: 100,
  enableFreeShipping: true,
  requiresShipping: true,
  weight: 0.8,
  dimensions: {
    length: 60,
    width: 45,
    height: 5
  },
  shippingClass: 'standard',
  specialHandling: ['Fragile'],
  shippingRules: [
    {
      id: 'rule-1',
      price: 5.99,
      locations: ['United States', 'Canada']
    },
    {
      id: 'rule-2',
      price: 14.99,
      locations: ['Europe', 'Australia']
    },
    {
      id: 'rule-3',
      price: 24.99,
      locations: ['Global']
    }
  ]
};

const ProductDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [activeTab, setActiveTab] = useState('overview');
  const [product, setProduct] = useState(mockProduct);
  const [metadata, setMetadata] = useState(mockMetadata);
  const [shippingConfig, setShippingConfig] = useState(mockShippingConfig);
  const [isLoading, setIsLoading] = useState(true);
  
  // Tabs for the product detail page
  const tabs = [
    { id: 'overview', name: 'Overview', icon: <EyeIcon className="h-5 w-5" /> },
    { id: 'metrics', name: 'Performance', icon: <ChartBarIcon className="h-5 w-5" /> },
    { id: 'metadata', name: 'SEO & Metadata', icon: <TagIcon className="h-5 w-5" /> },
    { id: 'shipping', name: 'Shipping', icon: <TruckIcon className="h-5 w-5" /> }
  ];
  
  // Fetch product data
  useEffect(() => {
    if (id) {
      // In a real app, this would be an API call to fetch the product data
      setIsLoading(false);
    }
  }, [id]);
  
  // Handle metadata save
  const handleSaveMetadata = async (productId: string, newMetadata: any) => {
    // In a real app, this would be an API call to update the product metadata
    console.log('Saving metadata for product:', productId, newMetadata);
    setMetadata(newMetadata);
    return Promise.resolve();
  };
  
  // Handle shipping configuration save
  const handleSaveShippingConfig = async (productId: string, newConfig: any) => {
    // In a real app, this would be an API call to update the shipping configuration
    console.log('Saving shipping config for product:', productId, newConfig);
    setShippingConfig(newConfig);
    return Promise.resolve();
  };
  
  // Handle product delete
  const handleDeleteProduct = async () => {
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      // In a real app, this would be an API call to delete the product
      console.log('Deleting product:', id);
      router.push('/merchant/products');
    }
  };
  
  if (isLoading) {
    return (
      <MerchantLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sage"></div>
        </div>
      </MerchantLayout>
    );
  }
  
  return (
    <>
      <Head>
        <title>{product.name} | Merchant Portal | av|nu</title>
        <meta name="description" content={`Manage ${product.name} on av|nu marketplace`} />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Back</span>
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{product.name}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  Product ID: {product.id} • SKU: {product.sku}
                </p>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                href={`/merchant/products/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                <PencilIcon className="-ml-1 mr-2 h-5 w-5 text-gray-500" aria-hidden="true" />
                Edit Product
              </Link>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <TrashIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <div className="sm:flex sm:items-baseline">
              <div className="mt-4 sm:mt-0 sm:ml-10">
                <nav className="-mb-px flex space-x-8">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                        ${activeTab === tab.id
                          ? 'border-sage text-sage'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex items-center">
                        <span className="mr-2">{tab.icon}</span>
                        {tab.name}
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="mt-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Product Info */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Product Information</h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900">{product.description}</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Price</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            ${product.price.toFixed(2)}
                            {product.compareAtPrice && (
                              <span className="ml-2 line-through text-gray-500">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Inventory</dt>
                          <dd className="mt-1 text-sm text-gray-900">{product.inventory} in stock</dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {product.category}
                            {product.subcategory && ` / ${product.subcategory}`}
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm text-gray-900">
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
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Created</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(product.createdAt).toLocaleDateString()}
                          </dd>
                        </div>
                        
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {new Date(product.updatedAt).toLocaleDateString()}
                          </dd>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Tags</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <div className="flex flex-wrap gap-2">
                              {product.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  {/* Product Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="bg-white shadow rounded-lg overflow-hidden">
                      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Product Variants</h3>
                      </div>
                      <div className="px-4 py-5 sm:p-6">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Variant
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  SKU
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Inventory
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {product.variants.map((variant) => (
                                <tr key={variant.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {Object.entries(variant.options).map(([key, value]) => (
                                      <div key={key}>
                                        <span className="font-medium">{key}:</span> {value}
                                      </div>
                                    ))}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {variant.sku}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${variant.price.toFixed(2)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {variant.inventory}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Product Images */}
                <div className="space-y-6">
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Product Images</h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      {product.images && product.images.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                          {product.images.map((image, index) => (
                            <div key={index} className="relative">
                              <Image
                                src={image}
                                alt={`${product.name} - Image ${index + 1}`}
                                width={200}
                                height={200}
                                className="object-cover rounded-md"
                              />
                              {index === 0 && (
                                <div className="absolute top-2 left-2 bg-sage text-white text-xs px-2 py-1 rounded">
                                  Main
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10">
                          <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No product images</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Add images to showcase your product.
                          </p>
                          <div className="mt-6">
                            <Link
                              href={`/merchant/products/${id}/edit`}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                            >
                              <PencilIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                              Add Images
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">Quick Actions</h3>
                    </div>
                    <div className="px-4 py-5 sm:p-6">
                      <ul className="divide-y divide-gray-200">
                        <li className="py-4">
                          <Link 
                            href={`/merchant/products/${id}/edit`}
                            className="text-sage hover:text-sage/80 font-medium"
                          >
                            Edit Product Details
                          </Link>
                        </li>
                        <li className="py-4">
                          <Link 
                            href={`/merchant/products/${id}/variants`}
                            className="text-sage hover:text-sage/80 font-medium"
                          >
                            Manage Variants
                          </Link>
                        </li>
                        <li className="py-4">
                          <Link 
                            href={`/merchant/products/${id}/inventory`}
                            className="text-sage hover:text-sage/80 font-medium"
                          >
                            Update Inventory
                          </Link>
                        </li>
                        <li className="py-4">
                          <Link 
                            href={`/merchant/advertising/new?product=${id}`}
                            className="text-sage hover:text-sage/80 font-medium"
                          >
                            Create Ad Campaign
                          </Link>
                        </li>
                        <li className="py-4">
                          <a 
                            href={`https://avnu.com/products/${metadata.urlSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sage hover:text-sage/80 font-medium"
                          >
                            View on Store
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Performance Metrics Tab */}
            {activeTab === 'metrics' && (
              <ProductPerformanceMetrics
                productId={product.id}
                productName={product.name}
              />
            )}
            
            {/* SEO & Metadata Tab */}
            {activeTab === 'metadata' && (
              <ProductMetadataEditor
                productId={product.id}
                initialMetadata={metadata}
                onSave={handleSaveMetadata}
              />
            )}
            
            {/* Shipping Tab */}
            {activeTab === 'shipping' && (
              <ShippingConfiguration
                productId={product.id}
                initialConfig={shippingConfig}
                onSave={handleSaveShippingConfig}
              />
            )}
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default ProductDetailPage;
