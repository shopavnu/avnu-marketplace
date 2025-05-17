import * as React from 'react';
import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import ApprovalModal from '../../../components/admin/ApprovalModal';
import RejectionModal from '../../../components/admin/RejectionModal';
import { applicationService, REJECTION_REASONS } from '../../../utils/api/applicationService';
import { MerchantApplication } from '../../../types/application';

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const ApplicationDetailPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  
  const [application, setApplication] = useState<MerchantApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  // Note: RejectionModal component manages rejection reason state internally
  
  // Load application data
  useEffect(() => {
    const loadApplication = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await applicationService.getApplicationById(id as string);
        if (!data) {
          setError('Application not found');
          setApplication(null);
        } else {
          setApplication(data);
        }
      } catch (err) {
        console.error('Failed to load application:', err);
        setError('Failed to load application details');
        setApplication(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadApplication();
  }, [id]);

  // Complete handler functions for approval/rejection
  const handleApprove = () => {
    setShowApproveModal(true);
  };
  
  const handleReject = () => {
    setShowRejectModal(true);
  };
  
  const confirmApproval = async () => {
    if (!application) return;
    
    setIsProcessing(true);
    try {
      const updatedApplication = await applicationService.updateApplicationStatus(
        application.id,
        'approved'
      );
      
      setApplication(updatedApplication);
      await applicationService.sendStatusNotification(updatedApplication);
      setShowApproveModal(false);
    } catch (err) {
      console.error('Failed to approve application:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const confirmRejection = async (feedback: string) => {
    if (!application) return;
    
    setIsProcessing(true);
    try {
      const updatedApplication = await applicationService.updateApplicationStatus(
        application.id,
        'rejected',
        feedback
      );
      
      setApplication(updatedApplication);
      await applicationService.sendStatusNotification(updatedApplication);
      setShowRejectModal(false);
    } catch (err) {
      console.error('Failed to reject application:', err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to determine status badge color
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Render the UI
  return (
    <AdminLayout>
      <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center">
          <Link href="/admin/applications" className="mr-4">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              &larr; Back
            </button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            {application ? `${application.brandInfo.name} Application` : 'Application Details'}
          </h1>
        </div>

        {application && application.status === 'pending' && (
          <div className="mt-3 flex sm:mt-0 sm:ml-4">
            <button
              onClick={handleReject}
              className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Approve
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4 mt-8">
          <div className="flex">
            <div className="flex-shrink-0">
              {/* Error icon */}
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      ) : application ? (
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Application Status */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Application Status</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Application submitted on {formatDate(application.submissionDate)}</p>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusBadgeClass(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                {application.feedback && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Feedback</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.feedback}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Brand Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Brand Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about the merchant's brand</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Brand Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.brandInfo.name}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.brandInfo.location}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.brandInfo.description}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Categories</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2">
                      {application.brandInfo.categories.map((category, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {category}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
                {application.brandInfo.causes && application.brandInfo.causes.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Causes</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <div className="flex flex-wrap gap-2">
                        {application.brandInfo.causes.map((cause, index) => (
                          <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {cause}
                          </span>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Merchant Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Merchant Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Contact and store details</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Owner Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.ownerName}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.email}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Shop Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.shopName}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Shop Domain</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a href={`https://${application.shopDomain}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-500">
                      {application.shopDomain}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about shipping options</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Free Shipping</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.shippingInfo.offersFreeShipping ? 'Yes' : 'No'}
                  </dd>
                </div>
                {application.shippingInfo.offersFreeShipping && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Free Shipping Threshold</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatCurrency(application.shippingInfo.freeShippingThreshold || 0)}
                    </dd>
                  </div>
                )}
                {application.shippingInfo.flatRateShipping !== undefined && (
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Flat Rate Shipping</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatCurrency(application.shippingInfo.flatRateShipping)}
                    </dd>
                  </div>
                )}
                {application.shippingInfo.shippingRestrictions && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Shipping Restrictions</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.shippingInfo.shippingRestrictions}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Returns Policy */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Returns Policy</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Details about returns and refunds</p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Accepts Returns</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {application.returnsPolicy.acceptsReturns ? 'Yes' : 'No'}
                  </dd>
                </div>
                {application.returnsPolicy.acceptsReturns && (
                  <>
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Return Window</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {application.returnsPolicy.returnWindow} days
                      </dd>
                    </div>
                    {application.returnsPolicy.returnShippingPaidBy && (
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">Return Shipping Paid By</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {application.returnsPolicy.returnShippingPaidBy === 'merchant' ? 'Merchant' : 'Customer'}
                        </dd>
                      </div>
                    )}
                  </>
                )}
                {application.returnsPolicy.returnsNotes && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Returns Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900">{application.returnsPolicy.returnsNotes}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Products */}
          <div className="sm:col-span-2 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Products ({application.products.length})</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Products submitted for review</p>
            </div>
            <div className="border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {application.products.map(product => (
                  <div key={product.id} className="border rounded-lg overflow-hidden shadow-sm">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.title} 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                          <span className="text-gray-400">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                      <div className="mt-2 flex justify-between">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(product.price)}</div>
                        <div className="text-sm text-gray-500">Stock: {product.inventory}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      
      {/* Approval and Rejection Modals */}
      {application && (
        <>
          <ApprovalModal
            isOpen={showApproveModal}
            isProcessing={isProcessing}
            merchantName={application.brandInfo.name}
            onClose={() => setShowApproveModal(false)}
            onApprove={confirmApproval}
          />
          
          <RejectionModal
            isOpen={showRejectModal}
            isProcessing={isProcessing}
            merchantName={application.brandInfo.name}
            onClose={() => setShowRejectModal(false)}
            onReject={confirmRejection}
            defaultReason={REJECTION_REASONS[0]}
          />
        </>
      )}
    </AdminLayout>
  );
};

export default ApplicationDetailPage;
