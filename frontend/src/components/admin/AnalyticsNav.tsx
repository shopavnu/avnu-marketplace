import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HomeIcon,
  ChartBarIcon,
  ShieldExclamationIcon,
  UserIcon,
  BeakerIcon,
  BellIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";

/**
 * Navigation component for the admin analytics section
 * Provides links to different analytics dashboards
 */
const AnalyticsNav: React.FC = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  // Combined navigation items from both branches
  const navItems = [
    {
      name: "Overview",
      href: "/admin/analytics",
      icon: HomeIcon,
      current: currentPath === "/admin/analytics",
    },
    {
      name: "Performance Metrics",
      href: "/admin/analytics/performance-metrics",
      icon: ChartBarIcon,
      current: currentPath === "/admin/analytics/performance-metrics",
    },
    {
      name: "User Behavior",
      href: "/admin/analytics/user-behavior",
      icon: UserIcon,
      current: currentPath === "/admin/analytics/user-behavior",
    },
    {
      name: "Search Performance",
      href: "/admin/analytics/search-performance",
      icon: MagnifyingGlassIcon,
      current: currentPath === "/admin/analytics/search-performance",
    },
    {
      name: "Personalization Testing",
      href: "/admin/analytics/personalization-testing",
      icon: BeakerIcon,
      current: currentPath === "/admin/analytics/personalization-testing",
    },
    {
      name: "Advanced Analytics",
      href: "/admin/analytics/advanced-analytics",
      icon: AdjustmentsHorizontalIcon,
      current: currentPath === "/admin/analytics/advanced-analytics",
    },
    {
      name: "Merchant Advertising",
      href: "/admin/analytics/merchant-advertising",
      icon: CurrencyDollarIcon,
      current: currentPath === "/admin/analytics/merchant-advertising",
    },
    {
      name: "Suppression Metrics",
      href: "/admin/analytics/suppression-metrics",
      icon: ExclamationTriangleIcon,
      current: currentPath === "/admin/analytics/suppression-metrics",
    },
    {
      name: "Alerts",
      href: "/admin/analytics/alerts",
      icon: BellIcon,
      current: currentPath === "/admin/analytics/alerts",
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Analytics
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <div className="flex overflow-x-auto py-3 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md mr-2 whitespace-nowrap ${
                item.current
                  ? "bg-sage text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <item.icon
                className={`mr-2 h-5 w-5 ${
                  item.current ? "text-white" : "text-gray-400"
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
