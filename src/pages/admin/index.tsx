import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import AdminLayout from '../../components/admin/AdminLayout';
import { applicationService } from '../../utils/api/applicationService';
import { MerchantApplication } from '../../types/application';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const AdminDashboard: NextPage = () => {
  const [applications, setApplications] = useState<MerchantApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadApplications = async () => {
      setIsLoading(true);
      try {
        const data = await applicationService.getApplications();
        setApplications(data);
      } catch (error) {
        console.error('Failed to load applications:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApplications();
  }, []);
  
  // Count applications by status
  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const approvedCount = applications.filter(app => app.status === 'approved').length;
  const rejectedCount = applications.filter(app => app.status === 'rejected').length;
  
  // Get recent applications (last 5)
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
    .slice(0, 5);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Pending Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-indigo-600">{pendingCount}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/applications?status=pending" className="font-medium text-indigo-600 hover:text-indigo-500">
                View all pending applications
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Approved Merchants</dt>
              <dd className="mt-1 text-3xl font-semibold text-green-600">{approvedCount}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/applications?status=approved" className="font-medium text-indigo-600 hover:text-indigo-500">
                View approved merchants
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">Rejected Applications</dt>
              <dd className="mt-1 text-3xl font-semibold text-red-600">{rejectedCount}</dd>
            </dl>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link href="/admin/applications?status=rejected" className="font-medium text-indigo-600 hover:text-indigo-500">
                View rejected applications
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Applications */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Applications</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Latest merchant applications submitted</p>
          </div>
          <Link href="/admin/applications" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            View all
          </Link>
        </div>
        
        {isLoading ? (
          <div className="px-4 py-5 sm:px-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : recentApplications.length === 0 ? (
          <div className="px-4 py-5 sm:px-6 text-center text-gray-500">
            No applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Review</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentApplications.map(application => {
                  const statusClass = application.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : application.status === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800';
                    
                  return (
                    <tr key={application.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {application.brandInfo.logoUrl ? (
                              <img src={application.brandInfo.logoUrl} alt="" className="h-10 w-10 rounded-full" />
                            ) : (
                              <span className="text-sm font-medium text-gray-500">
                                {application.brandInfo.name.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.brandInfo.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.shopDomain}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{application.ownerName}</div>
                        <div className="text-sm text-gray-500">{application.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(application.submissionDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/admin/applications/${application.id}`} className="text-indigo-600 hover:text-indigo-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Admin Actions */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Admin Actions</h3>
        </div>
        <div className="border-t border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4">
            <Link href="/admin/applications">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-indigo-600">Review Applications</h4>
                <p className="mt-1 text-sm text-gray-500">View and manage all merchant applications</p>
              </div>
            </Link>
            
            <Link href="/admin/merchants">
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <h4 className="font-medium text-indigo-600">Manage Merchants</h4>
                <p className="mt-1 text-sm text-gray-500">Manage all approved merchants and their products</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
