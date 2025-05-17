import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import reportService from '../../../utils/api/reportService';
import { ProductReport, ReportStatus, ReportAction, REPORT_REASON_DISPLAY, REPORT_STATUS_DISPLAY, REPORT_ACTION_DISPLAY } from '../../../types/report';

const ReportDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [report, setReport] = useState<ProductReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<ReportAction>('none');
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const loadReport = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        const data = await reportService.getReportById(id as string);
        setReport(data);
        
        // Initialize selected action if report has an action already
        if (data?.action) {
          setSelectedAction(data.action);
        }
        
        if (data?.actionNotes) {
          setActionNotes(data.actionNotes);
        }
      } catch (error) {
        console.error('Failed to load report:', error);
        setError('Failed to load the report. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReport();
  }, [id]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusBadgeClass = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      case 'actioned':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const handleSubmitAction = async () => {
    if (!report) return;
    
    setIsProcessing(true);
    setError('');
    
    try {
      let newStatus: ReportStatus = 'reviewed';
      
      // Determine the report status based on the action
      if (selectedAction === 'deactivate_product' || selectedAction === 'deactivate_merchant') {
        newStatus = 'actioned';
        
        // Perform the actual deactivation
        if (selectedAction === 'deactivate_product') {
          await reportService.deactivateProduct(report.productId, actionNotes);
        } else if (selectedAction === 'deactivate_merchant') {
          await reportService.deactivateMerchant(report.merchantId, actionNotes);
        }
      } else if (selectedAction === 'dismiss') {
        newStatus = 'dismissed';
      }
      
      // Update the report status
      const updatedReport = await reportService.updateReportStatus(
        report.id,
        newStatus,
        selectedAction,
        actionNotes
      );
      
      setReport(updatedReport);
    } catch (err) {
      console.error('Failed to process report action:', err);
      setError('Failed to process the action. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  if (!report) {
    return (
      <AdminLayout>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">Report not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The requested report could not be found.
            </p>
            <div className="mt-6">
              <Link
                href="/admin/reports"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Reports
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        {/* Back button and header */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/reports"
            className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <svg className="mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to reports
          </Link>
          
          <span 
            className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(report.status)}`}
          >
            {REPORT_STATUS_DISPLAY[report.status]}
          </span>
        </div>
        
        {/* Main content */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 flex justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Product Report #{report.id.substring(0, 8)}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Reported on {formatDate(report.dateReported)}
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
            <dl className="sm:divide-y sm:divide-gray-200">
              {/* Product Information */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Product</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 flex items-center">
                  {report.productImage ? (
                    <img 
                      src={report.productImage} 
                      alt={report.productName}
                      className="h-12 w-12 rounded object-cover flex-shrink-0 mr-3"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center flex-shrink-0 mr-3">
                      <span className="text-xs text-gray-500">No img</span>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{report.productName}</div>
                    <div className="text-sm text-gray-500">ID: {report.productId}</div>
                  </div>
                </dd>
              </div>
              
              {/* Merchant Information */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Merchant</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="font-medium">{report.merchantName}</div>
                  <div className="text-sm text-gray-500">ID: {report.merchantId}</div>
                </dd>
              </div>
              
              {/* Report Reason */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Reason</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {REPORT_REASON_DISPLAY[report.reason]}
                  {report.reason === 'other' && report.customReason && (
                    <span className="ml-2">- {report.customReason}</span>
                  )}
                </dd>
              </div>
              
              {/* Report Description */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {report.description}
                </dd>
              </div>
              
              {/* Reporter Information */}
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Reporter</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {report.reporterEmail || 'Anonymous'}
                </dd>
              </div>
              
              {/* Review Information (if reviewed) */}
              {report.status !== 'pending' && (
                <>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Reviewed On</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(report.reviewDate)}
                    </dd>
                  </div>
                  
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Action Taken</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {report.action ? REPORT_ACTION_DISPLAY[report.action] : 'None'}
                    </dd>
                  </div>
                  
                  {report.actionNotes && (
                    <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Action Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {report.actionNotes}
                      </dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>
        </div>
        
        {/* Action Panel (only shown for pending reports) */}
        {report.status === 'pending' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Take Action
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>
                  Review this report and take appropriate action. Your decision will be recorded and may affect the merchant's status.
                </p>
              </div>
              
              {error && (
                <div className="mt-4 p-3 rounded-md bg-red-50 text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div className="mt-5">
                <div className="space-y-5">
                  {/* Action Options */}
                  <div>
                    <label htmlFor="action" className="block text-sm font-medium text-gray-700">
                      Select Action
                    </label>
                    <select
                      id="action"
                      value={selectedAction}
                      onChange={(e) => setSelectedAction(e.target.value as ReportAction)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      disabled={isProcessing}
                    >
                      {Object.entries(REPORT_ACTION_DISPLAY).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Action Notes */}
                  <div>
                    <label htmlFor="action-notes" className="block text-sm font-medium text-gray-700">
                      Notes (optional)
                    </label>
                    <textarea
                      id="action-notes"
                      value={actionNotes}
                      onChange={(e) => setActionNotes(e.target.value)}
                      rows={3}
                      className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-indigo-500 focus:border-indigo-500 border border-gray-300 rounded-md"
                      placeholder="Add additional notes about your decision..."
                      disabled={isProcessing}
                    />
                  </div>
                  
                  {/* Warning for severe actions */}
                  {(selectedAction === 'deactivate_product' || selectedAction === 'deactivate_merchant') && (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Warning
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              {selectedAction === 'deactivate_product' ? 
                                'This will deactivate the product and prevent it from being displayed in the marketplace.' :
                                'This will deactivate the merchant and all their products from the marketplace. This is a severe action that should only be taken for serious violations.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmitAction}
                    disabled={isProcessing}
                    className={`inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isProcessing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    {isProcessing ? 'Processing...' : 'Submit Decision'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ReportDetail;
