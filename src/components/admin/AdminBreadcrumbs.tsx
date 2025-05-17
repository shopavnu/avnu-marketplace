import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Helper function to generate breadcrumb path segments from the current URL
const generateBreadcrumbs = (pathname: string): Array<{name: string; href: string}> => {
  // Remove any query parameters or hashes
  const path = pathname.split('?')[0].split('#')[0];
  
  // Split into segments and transform
  const segments = path.split('/').filter((segment) => segment !== '');
  
  // Build breadcrumbs with paths
  const breadcrumbs = [];
  let currentPath = '';
  
  // Always add home
  breadcrumbs.push({
    name: 'Admin',
    href: '/admin'
  });
  
  // Add path segments
  segments.forEach((segment, index) => {
    if (index === 0 && segment === 'admin') {
      // Skip 'admin' as we've already added it
      return;
    }
    
    currentPath += `/${segment}`;
    
    // Format the segment name (capitalize, replace hyphens with spaces)
    let name = segment;
    
    // Handle dynamic route segments that use [brackets]
    if (segment.startsWith('[') && segment.endsWith(']')) {
      // This is a dynamic segment like [id] - don't add it to breadcrumbs
      return;
    }
    
    // Format the name to be more readable
    name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    
    breadcrumbs.push({
      name,
      href: index === 0 ? '/admin' + currentPath : currentPath
    });
  });
  
  return breadcrumbs;
};

// Component to show the current page name based on URL
const PageHeading: React.FC = () => {
  const router = useRouter();
  
  // Extract the last segment of the path
  const pathSegments = router.pathname.split('/').filter(Boolean);
  let pageName = pathSegments[pathSegments.length - 1] || 'Dashboard';
  
  // Handle dynamic segments
  if (pageName.startsWith('[') && pageName.endsWith(']')) {
    // For dynamic routes like [id], use the actual value
    const params = router.query;
    const paramName = pageName.slice(1, -1);
    const paramValue = params[paramName];
    
    if (pathSegments.length > 1) {
      const parentSegment = pathSegments[pathSegments.length - 2];
      pageName = `${parentSegment.charAt(0).toUpperCase() + parentSegment.slice(1)} Details`;
    } else {
      pageName = paramValue as string || 'Detail';
    }
  }
  
  // Format the page name
  pageName = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
  
  // Special case for admin root
  if (router.pathname === '/admin') {
    pageName = 'Dashboard';
  }
  
  return (
    <h1 className="text-2xl font-semibold text-gray-900">{pageName}</h1>
  );
};

export default function AdminBreadcrumbs() {
  const router = useRouter();
  const breadcrumbs = generateBreadcrumbs(router.pathname);
  
  // Get dynamic path parameters to add to breadcrumbs
  const { id } = router.query;
  
  // For routes with dynamic parameters like [id], add the actual value
  if (id && typeof id === 'string' && router.pathname.includes('[id]')) {
    const lastBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
    
    // If we're on an application detail page, add the ID as a new breadcrumb
    if (lastBreadcrumb.name === 'Applications') {
      breadcrumbs.push({
        name: `Application ${id.substring(0, 8)}...`, // Truncate long IDs
        href: router.asPath
      });
    } else if (lastBreadcrumb.name === 'Merchants') {
      breadcrumbs.push({
        name: `Merchant ${id.substring(0, 8)}...`,
        href: router.asPath
      });
    }
  }

  return (
    <div className="mb-6">
      <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:items-center md:justify-between">
        {/* Breadcrumb navigation */}
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((breadcrumb, index) => (
              <li key={breadcrumb.href} className="flex items-center">
                {index > 0 && (
                  <svg className="flex-shrink-0 mx-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-sm font-medium text-gray-500 truncate">
                    {breadcrumb.name}
                  </span>
                ) : (
                  <Link
                    href={breadcrumb.href}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    {breadcrumb.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
        
        {/* Page heading for small screens */}
        <div className="md:hidden">
          <PageHeading />
        </div>
      </div>
      
      {/* Page heading for larger screens */}
      <div className="hidden md:block mt-2">
        <PageHeading />
      </div>
    </div>
  );
}
