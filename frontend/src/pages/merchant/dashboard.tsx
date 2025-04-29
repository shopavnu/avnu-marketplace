import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  EyeIcon,
  ArrowRightIcon,
  CubeIcon,
  MegaphoneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import MerchantLayout from '@/components/merchant/MerchantLayout';

// Mock data for dashboard
const stats = [
  { 
    id: 1, 
    name: 'Revenue', 
    value: '$12,430', 
    change: '+12.5%', 
    trend: 'up',
    icon: CurrencyDollarIcon,
    color: 'bg-green-100 text-green-800'
  },
  { 
    id: 2, 
    name: 'Orders', 
    value: '356', 
    change: '+8.2%', 
    trend: 'up',
    icon: ShoppingBagIcon,
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    id: 3, 
    name: 'Customers', 
    value: '1,245', 
    change: '+18.3%', 
    trend: 'up',
    icon: UserIcon,
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    id: 4, 
    name: 'Page Views', 
    value: '24,589', 
    change: '-3.4%', 
    trend: 'down',
    icon: EyeIcon,
    color: 'bg-amber-100 text-amber-800'
  },
];

const recentOrders = [
  { id: 'ORD-001', customer: 'Sarah Johnson', date: '2025-04-20', total: 125.99, status: 'Delivered' },
  { id: 'ORD-002', customer: 'Michael Chen', date: '2025-04-19', total: 89.50, status: 'Processing' },
  { id: 'ORD-003', customer: 'Emily Rodriguez', date: '2025-04-18', total: 210.75, status: 'Shipped' },
  { id: 'ORD-004', customer: 'David Kim', date: '2025-04-17', total: 45.99, status: 'Processing' },
  { id: 'ORD-005', customer: 'Jessica Lee', date: '2025-04-16', total: 156.50, status: 'Delivered' },
];

const topProducts = [
  { id: 'PROD-001', name: 'Organic Cotton T-Shirt', sales: 124, revenue: 3720 },
  { id: 'PROD-002', name: 'Bamboo Water Bottle', sales: 98, revenue: 2450 },
  { id: 'PROD-003', name: 'Recycled Denim Jacket', sales: 76, revenue: 6080 },
  { id: 'PROD-004', name: 'Hemp Canvas Tote Bag', sales: 65, revenue: 1625 },
  { id: 'PROD-005', name: 'Sustainable Yoga Mat', sales: 52, revenue: 2080 },
];

const MerchantDashboard = () => {
  return (
    <>
      <Head>
        <title>Merchant Dashboard | av|nu</title>
        <meta name="description" content="Merchant dashboard for av|nu marketplace" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="mt-4 sm:mt-0">
              <span className="text-sm font-medium text-gray-500">
                Last updated: April 22, 2025
              </span>
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className="bg-white overflow-hidden shadow rounded-lg"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <stat.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">{stat.value}</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <div className="font-medium text-sage truncate flex items-center">
                      {stat.trend === 'up' ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${stat.color}`}>
                        {stat.change} from last month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Orders */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
                <Link href="/merchant/orders" className="text-sm font-medium text-sage hover:text-sage/80 flex items-center">
                  View all
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-sage">
                          <Link href={`/merchant/orders/${order.id}`}>
                            {order.id}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${order.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'Shipped'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
                <Link href="/merchant/products" className="text-sm font-medium text-sage hover:text-sage/80 flex items-center">
                  View all
                  <ArrowRightIcon className="ml-1 h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sales
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {topProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <Link href={`/merchant/products/${product.id}`} className="text-sage hover:text-sage/80">
                            {product.name}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {product.sales} units
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${product.revenue.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-sage/10 rounded-md p-3">
                      <CubeIcon className="h-6 w-6 text-sage" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Create a new product listing to expand your catalog
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/merchant/products/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                    >
                      Add Product
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Suppressed Products</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Fix products hidden due to missing information
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/merchant/products/suppressed"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      View Suppressed
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-sage/10 rounded-md p-3">
                      <MegaphoneIcon className="h-6 w-6 text-sage" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Create Ad Campaign</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Promote your products with targeted advertising
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/merchant/advertising/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                    >
                      Create Campaign
                    </Link>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-sage/10 rounded-md p-3">
                      <ShoppingBagIcon className="h-6 w-6 text-sage" aria-hidden="true" />
                    </div>
                    <div className="ml-5">
                      <h3 className="text-lg font-medium text-gray-900">Process Orders</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        View and manage your pending orders
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link
                      href="/merchant/orders?status=pending"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                    >
                      View Orders
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default MerchantDashboard;
