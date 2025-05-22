import React, { ReactNode, useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import MobileSidebar from './MobileSidebar';
import AdminBreadcrumbs from './AdminBreadcrumbs';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  // State for mobile sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Desktop sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header */}
        <AdminHeader toggleSidebar={() => setSidebarOpen(true)} />
        
        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            <AdminBreadcrumbs />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
