import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if user is admin (this would be replaced with actual auth logic)
  useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        // In a real implementation, this would be an API call to check admin status
        // For now, we'll just simulate it with a timeout
        await new Promise((resolve) => setTimeout(resolve, 500));

        // For development, we'll assume the user is an admin
        // In production, this would check the user's role from a JWT token or API
        setIsAdmin(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Authentication error:", error);
        setIsAdmin(false);
        setIsLoading(false);
        router.push("/login");
      }
    };

    checkAuth();
  }, [router]);

  // Navigation items
  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: HomeIcon,
      current: router.pathname === "/admin",
    },
    {
      name: "Analytics",
      href: "/admin/analytics",
      icon: ChartBarIcon,
      current: router.pathname.startsWith("/admin/analytics"),
    },
    {
      name: "Search",
      href: "/admin/search",
      icon: MagnifyingGlassIcon,
      current: router.pathname.startsWith("/admin/search"),
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: UserGroupIcon,
      current: router.pathname.startsWith("/admin/users"),
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: ShoppingBagIcon,
      current: router.pathname.startsWith("/admin/products"),
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: TagIcon,
      current: router.pathname.startsWith("/admin/categories"),
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: CogIcon,
      current: router.pathname.startsWith("/admin/settings"),
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Router will redirect, no need to render anything
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
          <div className="flex-1 flex flex-col min-h-0 bg-charcoal">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <span className="text-xl font-semibold text-white">
                  Avnu Admin
                </span>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md
                      ${item.current ? "bg-sage text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"}
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 flex-shrink-0 h-6 w-6
                        ${item.current ? "text-white" : "text-gray-400 group-hover:text-gray-300"}
                      `}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="md:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <h1 className="text-2xl font-semibold text-charcoal">
                  {title}
                </h1>
              </div>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="py-4">{children}</div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
