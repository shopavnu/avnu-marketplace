import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import reportService from '../../../utils/api/reportService';
import { MerchantReportSummary } from '../../../types/report';

const MerchantReportSummaries: NextPage = () => {
  const [summaries, setSummaries] = useState<MerchantReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadSummaries = async () => {
      setIsLoading(true);
      try {
        const data = await reportService.getMerchantReportSummaries();
        setSummaries(data);
      } catch (error) {
        console.error('Failed to load merchant report summaries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSummaries();
  }, []);
  
  // Helper function to determine the severity class based on report count
  const getSeverityClass = (totalReports: number): string => {
    if (totalReports >= 5) return 'bg-red-100 text-red-800';
    if (totalReports >= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };
  
  // Helper function to determine severity text
  const getSeverityText = (totalReports: number): string => {
    if (totalReports >= 5) return 'High';
    if (totalReports >= 3) return 'Medium';
    return 'Low';
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Merchant Report Summary</h1>
            <p className="mt-1 text-sm text-gray-500">
              Overview of reported issues by merchant to track problematic sellers
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              href="/admin/reports"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to Reports
            </Link>
          </div>
        </div>
        
        {/* Summaries content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            </div>
          ) : summaries.length === 0 ? (
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No summaries found</h3>
              <p className="mt-1 text-sm text-gray-500">
                There are no product reports to analyze yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Merchant
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Reports
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pending
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actioned
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dismissed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">View</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {summaries.map((summary) => (
                    <tr key={summary.merchantId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{summary.merchantName}</div>
                        <div className="text-sm text-gray-500">ID: {summary.merchantId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.totalReports}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.pendingReports}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.actionedReports}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {summary.dismissedReports}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(summary.totalReports)}`}>
                          {getSeverityText(summary.totalReports)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/admin/reports?merchantId=${summary.merchantId}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          View Reports
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Risk level legend */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-4">
          <h3 className="text-base font-medium text-gray-900 mb-4">Risk Level Legend</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <span className="inline-block h-4 w-4 rounded-full bg-green-100 mr-2"></span>
              <span className="text-sm text-gray-700">
                <strong>Low Risk:</strong> 0-2 reports
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-4 w-4 rounded-full bg-yellow-100 mr-2"></span>
              <span className="text-sm text-gray-700">
                <strong>Medium Risk:</strong> 3-4 reports
              </span>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-4 w-4 rounded-full bg-red-100 mr-2"></span>
              <span className="text-sm text-gray-700">
                <strong>High Risk:</strong> 5+ reports
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>
              Merchants with high risk levels should be reviewed carefully for potential policy violations. 
              Consider reviewing all products from high-risk merchants to ensure compliance with marketplace policies.
            </p>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-4">
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={() => window.print()}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print Report
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default MerchantReportSummaries;
