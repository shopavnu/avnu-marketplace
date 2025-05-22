import React, { useState } from 'react';

interface ProductInfo {
  id: string;
  name: string;
  imageUrl?: string;
  merchantId: string;
  merchantName: string;
}

interface ReportProductButtonProps {
  product: ProductInfo;
  className?: string;
  buttonSize?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'icon'; // Different display variants
}

export default function ReportProductButton({
  product,
  className = '',
  buttonSize = 'medium',
  variant = 'text'
}: ReportProductButtonProps) {
  const [showReportModal, setShowReportModal] = useState(false);

  // Size classes based on buttonSize prop
  const getSizeClasses = () => {
    switch (buttonSize) {
      case 'small':
        return 'text-xs px-2 py-1';
      case 'large':
        return 'text-base px-4 py-2';
      default: // medium
        return 'text-sm px-3 py-1.5';
    }
  };
  
  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'outlined':
        return 'border border-gray-300 hover:bg-gray-50 rounded-md';
      case 'icon':
        return 'text-gray-500 hover:text-gray-700';
      default: // text
        return 'text-gray-600 hover:text-gray-800 hover:underline';
    }
  };

  // Flag icon for button
  const FlagIcon = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={`${buttonSize === 'small' ? 'h-4 w-4' : buttonSize === 'large' ? 'h-6 w-6' : 'h-5 w-5'} ${variant === 'text' || variant === 'outlined' ? 'mr-1' : ''}`} 
      viewBox="0 0 20 20" 
      fill="currentColor"
    >
      <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
    </svg>
  );

  return (
    <>
      <button
        onClick={() => setShowReportModal(true)}
        className={`inline-flex items-center justify-center transition-colors ${getSizeClasses()} ${getVariantClasses()} ${className}`}
        aria-label="Report product"
        title="Report this product"
      >
        <FlagIcon />
        {variant !== 'icon' && <span>Report</span>}
      </button>

      {/* Note: In a production implementation, this would use the actual ReportProductModal component */}
      {showReportModal && (
        <div className="fixed inset-0 z-30 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowReportModal(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg font-medium text-gray-900">Report {product.name}</h3>
                    <p className="text-sm text-gray-500 mt-2">Report this product if it violates marketplace policies. Product ID: {product.id}</p>
                    <p className="text-sm text-gray-500">Sold by: {product.merchantName}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Report
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowReportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
