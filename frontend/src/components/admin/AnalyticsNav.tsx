import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  ChartBarIcon,
  BeakerIcon,
  BellIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const AnalyticsNav: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    {
      name: 'Overview',
      href: '/admin/analytics',
      icon: ChartBarIcon,
      current: currentPath === '/admin/analytics',
    },
    {
      name: 'A/B Testing',
      href: '/admin/analytics/ab-testing',
      icon: BeakerIcon,
      current: currentPath === '/admin/analytics/ab-testing',
    },
    {
      name: 'User Journey',
      href: '/admin/analytics/user-journey',
      icon: UserGroupIcon,
      current: currentPath === '/admin/analytics/user-journey',
    },
    {
      name: 'User Segments',
      href: '/admin/analytics/user-segments',
      icon: UserGroupIcon,
      current: currentPath === '/admin/analytics/user-segments',
    },
    {
      name: 'Search Personalization',
      href: '/admin/analytics/search-personalization',
      icon: MagnifyingGlassIcon,
      current: currentPath === '/admin/analytics/search-personalization',
    },
    {
      name: 'Suppression Metrics',
      href: '/admin/analytics/suppression-metrics',
      icon: ExclamationTriangleIcon,
      current: currentPath === '/admin/analytics/suppression-metrics',
    },
    {
      name: 'Alerts',
      href: '/admin/analytics/alerts',
      icon: BellIcon,
      current: currentPath === '/admin/analytics/alerts',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Analytics</h3>
      </div>
      <div className="border-t border-gray-200">
        <div className="flex overflow-x-auto py-3 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                item.current
                  ? 'bg-sage text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon
                className={`mr-2 h-5 w-5 ${
                  item.current ? 'text-white' : 'text-gray-400'
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsNav;
