import React, { useState } from 'react';
import { REJECTION_REASONS } from '../../utils/api/applicationService';

interface RejectionModalProps {
  isOpen: boolean;
  isProcessing: boolean;
  merchantName: string;
  onClose: () => void;
  onReject: (reason: string) => void;
  defaultReason?: string;
}

export default function RejectionModal({
  isOpen,
  isProcessing,
  merchantName,
  onClose,
  onReject,
  defaultReason = REJECTION_REASONS[0]
}: RejectionModalProps) {
  const [selectedReason, setSelectedReason] = useState(defaultReason);
  const [customReason, setCustomReason] = useState('');

  if (!isOpen) return null;

  const handleReject = () => {
    // If "Other" is selected, use the custom reason
    const finalReason = selectedReason === 'Other (please specify)' 
      ? customReason 
      : selectedReason;
    
    // Only proceed if there is a reason provided
    if (finalReason.trim()) {
      onReject(finalReason);
    }
  };

  const needsCustomReason = selectedReason === 'Other (please specify)';

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                {/* X icon */}
                <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  Reject Application
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 mb-4">
                    Please select a reason for rejecting {merchantName}'s application:
                  </p>

                  <div className="mb-4">
                    <select
                      value={selectedReason}
                      onChange={(e) => setSelectedReason(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      disabled={isProcessing}
                    >
                      {REJECTION_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  {needsCustomReason && (
                    <div className="mb-4">
                      <label htmlFor="custom-reason" className="block text-sm font-medium text-gray-700">
                        Please specify the reason
                      </label>
                      <textarea
                        id="custom-reason"
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Provide detailed feedback for the merchant"
                        disabled={isProcessing}
                      />
                    </div>
                  )}

                  <p className="text-sm text-gray-500 mt-4">
                    This feedback will be sent directly to the merchant. They will need to address these issues before reapplying.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              disabled={isProcessing || (needsCustomReason && !customReason.trim())}
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                isProcessing || (needsCustomReason && !customReason.trim()) 
                  ? 'bg-red-300 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={handleReject}
            >
              {isProcessing ? 'Processing...' : 'Reject Application'}
            </button>
            <button
              type="button"
              disabled={isProcessing}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
