import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface BulkVisibilityToggleProps {
  selectedProductIds: string[];
  onToggleVisibility: (productIds: string[], visible: boolean) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

const BulkVisibilityToggle = ({
  selectedProductIds,
  onToggleVisibility,
  onCancel,
  isOpen
}: BulkVisibilityToggleProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleVisibility = async (visible: boolean) => {
    if (selectedProductIds.length === 0) {
      setError('No products selected');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onToggleVisibility(selectedProductIds, visible);
      onCancel(); // Close the modal after successful operation
    } catch (err: unknown) {
      setError(`Failed to ${visible ? 'show' : 'hide'} products`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Change Product Visibility</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500"
            onClick={onCancel}
            disabled={isLoading}
          >
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-sm text-gray-500 mb-4">
            Update visibility for <span className="font-medium">{selectedProductIds.length}</span> product{selectedProductIds.length !== 1 ? 's' : ''}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => handleToggleVisibility(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" aria-hidden="true" />
              ) : (
                <EyeIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              )}
              Make Visible
            </button>
            
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              onClick={() => handleToggleVisibility(false)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" aria-hidden="true" />
              ) : (
                <EyeSlashIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              )}
              Make Hidden
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          <div className="mt-6 text-xs text-gray-500">
            <p>Making products visible will display them in the marketplace.</p>
            <p>Making products hidden will remove them from the marketplace but keep them in your inventory.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkVisibilityToggle;
