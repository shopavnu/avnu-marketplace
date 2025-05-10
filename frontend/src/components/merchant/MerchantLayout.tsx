import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { 
  BuildingStorefrontIcon,
  ChartBarIcon, 
  Cog6ToothIcon, 
  CubeIcon, 
  HomeIcon, 
  MegaphoneIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserGroupIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface MerchantLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/merchant/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/merchant/products', icon: CubeIcon },
  { name: 'Orders', href: '/merchant/orders', icon: ShoppingBagIcon },
  { name: 'Shipping', href: '/merchant/shipping', icon: TruckIcon },
  { name: 'Advertising', href: '/merchant/advertising', icon: MegaphoneIcon },
  { name: 'Analytics', href: '/merchant/analytics', icon: ChartBarIcon },
  { name: 'Customers', href: '/merchant/customers', icon: UserGroupIcon },
  { name: 'Integrations', href: '/merchant/integrations', icon: BuildingStorefrontIcon },
  { name: 'Settings', href: '/merchant/settings', icon: Cog6ToothIcon },
];

const MerchantLayout = ({ children }: MerchantLayoutProps) => {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Mock merchant data - would come from API/context in real app
  const merchant = {
    name: 'Eco Essentials',
    logo: null, // Placeholder for merchant logo
    user: {
      name: 'Alex Johnson',
      email: 'alex@ecoessentials.com'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        {/* Overlay */}
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        
        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <Link href="/merchant/dashboard" className="flex items-center">
                <BuildingStorefrontIcon className="h-8 w-8 text-sage mr-2" />
                <span className="text-xl font-semibold text-charcoal">av|nu merchant</span>
              </Link>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-sage/10 text-sage'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-sage' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <Link href="/" className="flex-shrink-0 group block">
              <div className="flex items-center">
                <div className="inline-block h-10 w-10 rounded-full bg-sage/10 overflow-hidden flex items-center justify-center">
                  {merchant.logo ? (
                    <Image
                      src={merchant.logo}
                      alt={merchant.name}
                      width={40}
                      height={40}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BuildingStorefrontIcon className="h-6 w-6 text-sage" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                    {merchant.name}
                  </p>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700">
                    View storefront
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-5">
              <Link href="/merchant/dashboard" className="flex items-center">
                <BuildingStorefrontIcon className="h-8 w-8 text-sage mr-2" />
                <span className="text-xl font-semibold text-charcoal">av|nu merchant</span>
              </Link>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href || router.pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-sage/10 text-sage'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-sage' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex flex-col border-t border-gray-200 p-4">
            <Link href="/" className="flex-shrink-0 w-full group block mb-4">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-sage/10 overflow-hidden flex items-center justify-center">
                  {merchant.logo ? (
                    <Image
                      src={merchant.logo}
                      alt={merchant.name}
                      width={36}
                      height={36}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <BuildingStorefrontIcon className="h-5 w-5 text-sage" />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {merchant.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    View storefront
                  </p>
                </div>
              </div>
            </Link>
            <button
              onClick={() => router.push('/')}
              className="flex items-center px-2 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50"
            >
              <ArrowLeftOnRectangleIcon className="mr-3 flex-shrink-0 h-6 w-6 text-red-500" aria-hidden="true" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sage lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 flex justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex-1 flex items-center">
              <BuildingStorefrontIcon className="h-8 w-8 text-sage mr-2" />
              <span className="text-xl font-semibold text-charcoal">av|nu merchant</span>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="inline-block h-8 w-8 rounded-full bg-sage/10 overflow-hidden flex items-center justify-center">
                    {merchant.logo ? (
                      <Image
                        src={merchant.logo}
                        alt={merchant.name}
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <BuildingStorefrontIcon className="h-5 w-5 text-sage" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MerchantLayout;
