import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

/**
 * Navigation component for the admin analytics section
 * Provides links to different analytics dashboards
 */
const AnalyticsNav: React.FC = () => {
  const router = useRouter();
  
  const navItems = [
    { name: 'Overview', path: '/admin/analytics' },
    { name: 'Performance Metrics', path: '/admin/analytics/performance-metrics' },
    { name: 'User Behavior', path: '/admin/analytics/user-behavior' },
    { name: 'Suppression Metrics', path: '/admin/analytics/suppression-metrics' }
  ];

  return (
    <div className="mb-6 border-b border-gray-200">
      <nav className="flex space-x-8">
        {navItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                isActive
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AnalyticsNav;
