import * as React from 'react';
import { useState } from 'react';
import { ReportReason, REPORT_REASON_DISPLAY } from '../../types/report';
import reportService from '../../utils/api/reportService';

interface ProductInfo {
  id: string;
  name: string;
  imageUrl?: string;
  merchantId: string;
  merchantName: string;
}

interface ReportProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductInfo;
}

export default function ReportProductModal({
  isOpen,
  onClose,
  product
}: ReportProductModalProps) {
  const [reason, setReason] = useState<ReportReason>('prohibited_item');
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Reset the form when the modal opens
  React.useEffect(() => {
    if (isOpen) {
      setReason('prohibited_item');
      setDescription('');
      setEmail('');
      setCustomReason('');
      setIsSubmitted(false);
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!reason) {
      setError('Please select a reason.');
      return;
    }
    
    if (reason === 'other' && !customReason.trim()) {
      setError('Please provide details for your report.');
      return;
    }
    
    if (!description.trim()) {
      setError('Please provide a description of the issue.');
      return;
    }
    
    // Optional email validation
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Submit the report
      await reportService.createReport({
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        merchantId: product.merchantId,
        merchantName: product.merchantName,
        reporterEmail: email || undefined,
        reason,
        customReason: reason === 'other' ? customReason : undefined,
        description,
      });
      
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to submit report. Please try again later.');
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-30 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>

        {/* Modal panel */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-headline"
        >
          {isSubmitted ? (
            // Success message
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  {/* Checkmark icon */}
                  <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                    Report Submitted
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Thank you for your report. Our team will review this product and take appropriate action if needed.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Report form
            <form onSubmit={handleSubmit}>
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    {/* Flag icon */}
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                      Report Product
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-4">
                        You are reporting: <strong>{product.name}</strong>
                      </p>
                      
                      {error && (
                        <div className="mb-4 p-2 bg-red-50 text-red-700 text-sm rounded">
                          {error}
                        </div>
                      )}
                      
                      {/* Report reason */}
                      <div className="mb-4">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                          Reason for report
                        </label>
                        <select
                          id="reason"
                          value={reason}
                          onChange={(e) => setReason(e.target.value as ReportReason)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                          disabled={isSubmitting}
                        >
                          {Object.entries(REPORT_REASON_DISPLAY).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      {/* Custom reason field (for "other") */}
                      {reason === 'other' && (
                        <div className="mb-4">
                          <label htmlFor="custom-reason" className="block text-sm font-medium text-gray-700">
                            Please specify
                          </label>
                          <input
                            type="text"
                            id="custom-reason"
                            value={customReason}
                            onChange={(e) => setCustomReason(e.target.value)}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                      
                      {/* Report description */}
                      <div className="mb-4">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          rows={3}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="Please provide details about why this product violates marketplace policies."
                          disabled={isSubmitting}
                        />
                      </div>
                      
                      {/* Email (optional) */}
                      <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Your email (optional)
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                          placeholder="We'll only contact you if we need more information"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                    isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
