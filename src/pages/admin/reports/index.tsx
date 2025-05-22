import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import reportService from '../../../utils/api/reportService';
import { ProductReport, ReportStatus, REPORT_REASON_DISPLAY, REPORT_STATUS_DISPLAY } from '../../../types/report';

const ReportsList: NextPage = () => {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  
  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getReports(
          statusFilter ? { status: statusFilter as ReportStatus } : undefined
        );
        setReports(data);
      } catch (error) {
        console.error('Failed to load reports:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReports();
  }, [statusFilter]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusClass = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'actioned':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Product Reports</h1>
          
          <div className="mt-4 md:mt-0 flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReportStatus | '')}
              className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">All Reports</option>
              {Object.entries(REPORT_STATUS_DISPLAY).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Reports content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12">
              <svg 
                className="mx-auto h-12 w-12 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {statusFilter ? `No ${statusFilter} reports to display.` : 'There are no product reports yet.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reports.map((report) => (
                <li key={report.id}>
                  <Link href={`/admin/reports/${report.id}`} className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                          {report.productImage ? (
                            <img 
                              className="h-12 w-12 rounded object-cover flex-shrink-0" 
                              src={report.productImage}
                              alt={report.productName}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-gray-500">No img</span>
                            </div>
                          )}
                          <div className="ml-4 flex-1 min-w-0">
                            <p className="text-sm font-medium text-indigo-600 truncate">
                              {report.productName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {report.merchantName}
                            </p>
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center">
                          <span 
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(report.status)}`}
                          >
                            {REPORT_STATUS_DISPLAY[report.status]}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Reason: {REPORT_REASON_DISPLAY[report.reason]}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg 
                            className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 20 20" 
                            fill="currentColor" 
                            aria-hidden="true"
                          >
                            <path 
                              fillRule="evenodd" 
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" 
                              clipRule="evenodd" 
                            />
                          </svg>
                          <p>
                            Reported on <time dateTime={report.dateReported}>{formatDate(report.dateReported)}</time>
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Link to merchant report summaries */}
        <div className="flex justify-end">
          <Link 
            href="/admin/reports/merchants" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            View Merchant Report Summaries
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsList;
