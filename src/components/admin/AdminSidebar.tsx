import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Icons (using inline SVG for simplicity, but you could import from a library like heroicons)
const DashboardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ApplicationsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ProductsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const MerchantsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const OrdersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const ReportsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

const NavItem = ({ href, label, icon, isActive }: NavItemProps) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-gray-100 ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
    }`}
  >
    <span className={`mr-3 ${isActive ? 'text-indigo-500' : 'text-gray-500'}`}>{icon}</span>
    {label}
  </Link>
);

interface NavSectionProps {
  title: string;
  children: React.ReactNode;
}

const NavSection = ({ title, children }: NavSectionProps) => (
  <div className="mb-6">
    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <div className="mt-2 space-y-1">
      {children}
    </div>
  </div>
);

export default function AdminSidebar() {
  const router = useRouter();
  
  // Helper to check if a path is active
  const isActive = (path: string): boolean => {
    if (path === '/admin' && router.pathname === '/admin') {
      return true;
    }
    return router.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <div className="hidden md:block md:w-64 bg-white shadow-sm border-r border-gray-200">
      <div className="h-full px-4 py-6 overflow-y-auto">
        <div className="flex items-center justify-center mb-8">
          <span className="text-xl font-bold text-indigo-600">Avnu Admin</span>
        </div>
        
        {/* Main Navigation */}
        <NavSection title="Main">
          <NavItem 
            href="/admin" 
            label="Dashboard" 
            icon={<DashboardIcon />} 
            isActive={isActive('/admin')} 
          />
          <NavItem 
            href="/admin/applications" 
            label="Applications" 
            icon={<ApplicationsIcon />} 
            isActive={isActive('/admin/applications')} 
          />
        </NavSection>
        
        {/* Marketplace Management */}
        <NavSection title="Marketplace">
          <NavItem 
            href="/admin/merchants" 
            label="Merchants" 
            icon={<MerchantsIcon />} 
            isActive={isActive('/admin/merchants')} 
          />
          <NavItem 
            href="/admin/products" 
            label="Products" 
            icon={<ProductsIcon />} 
            isActive={isActive('/admin/products')} 
          />
          <NavItem 
            href="/admin/orders" 
            label="Orders" 
            icon={<OrdersIcon />} 
            isActive={isActive('/admin/orders')} 
          />
          <NavItem 
            href="/admin/reports" 
            label="Reports" 
            icon={<ReportsIcon />} 
            isActive={isActive('/admin/reports')} 
          />
        </NavSection>
        
        {/* Insights */}
        <NavSection title="Insights">
          <NavItem 
            href="/admin/analytics" 
            label="Analytics" 
            icon={<AnalyticsIcon />} 
            isActive={isActive('/admin/analytics')} 
          />
        </NavSection>
        
        {/* Settings */}
        <NavSection title="Administration">
          <NavItem 
            href="/admin/settings" 
            label="Settings" 
            icon={<SettingsIcon />} 
            isActive={isActive('/admin/settings')} 
          />
        </NavSection>
      </div>
    </div>
  );
}
