import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

// Icons (simplified versions of what's in AdminSidebar)
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

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const router = useRouter();
  
  // Helper to check if a path is active
  const isActive = (path: string): boolean => {
    if (path === '/admin' && router.pathname === '/admin') {
      return true;
    }
    return router.pathname.startsWith(path) && path !== '/admin';
  };

  if (!isOpen) return null;

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/admin/applications', label: 'Applications', icon: <ApplicationsIcon /> },
    { href: '/admin/merchants', label: 'Merchants', icon: <MerchantsIcon /> },
    { href: '/admin/products', label: 'Products', icon: <ProductsIcon /> },
  ];

  return (
    <div className="md:hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      ></div>
      
      {/* Sidebar drawer */}
      <div className="fixed inset-y-0 left-0 max-w-xs w-full z-30 bg-white shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200">
          <div className="font-bold text-lg text-indigo-600">Avnu Admin</div>
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>
        
        <nav className="px-4 py-3">
          <ul className="space-y-4">
            {menuItems.map(item => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center py-3 px-4 rounded-md text-sm font-medium ${
                    isActive(item.href) 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={onClose}
                >
                  <span className={`mr-4 ${isActive(item.href) ? 'text-indigo-500' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Additional sections in mobile nav */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Account
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/admin/settings"
                  className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={onClose}
                >
                  Settings
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/logout"
                  className="flex items-center py-2 px-4 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                  onClick={onClose}
                >
                  Sign Out
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
