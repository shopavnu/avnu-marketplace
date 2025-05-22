import { useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { Product } from "@/types/product";

interface SuppressedProductsBulkActionsProps {
  selectedProducts: Product[];
  onRevalidate: (productIds: string[]) => void;
  onBulkEdit: (productIds: string[]) => void;
  onClearSelection: () => void;
}

const SuppressedProductsBulkActions: React.FC<
  SuppressedProductsBulkActionsProps
> = ({ selectedProducts, onRevalidate, onBulkEdit, onClearSelection }) => {
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [actionResult, setActionResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleRevalidate = async () => {
    if (selectedProducts.length === 0) return;

    setIsActionInProgress(true);
    setActionResult(null);

    try {
      await onRevalidate(selectedProducts.map((p) => p.id));
      setActionResult({
        success: true,
        message: `${selectedProducts.length} product(s) revalidated successfully.`,
      });
    } catch (error) {
      setActionResult({
        success: false,
        message: "Failed to revalidate products. Please try again.",
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleBulkEdit = () => {
    if (selectedProducts.length === 0) return;
    onBulkEdit(selectedProducts.map((p) => p.id));
  };

  // If no products are selected, don't render the component
  if (selectedProducts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-sage shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-sage-800">
                <CheckCircleIcon
                  className="h-6 w-6 text-white"
                  aria-hidden="true"
                />
              </span>
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">
                  {selectedProducts.length} product(s) selected
                </span>
                <span className="hidden md:inline">
                  {selectedProducts.length} product(s) selected for bulk action
                </span>
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center space-x-2">
              {actionResult && (
                <div
                  className={`flex items-center px-3 py-1 rounded-md text-sm ${
                    actionResult.success
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {actionResult.success ? (
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  )}
                  <span>{actionResult.message}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRevalidate}
                disabled={isActionInProgress}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-sage-800 bg-white hover:bg-sage-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                {isActionInProgress ? (
                  <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <ArrowPathIcon className="h-4 w-4 mr-1.5" />
                )}
                Revalidate
              </button>

              <button
                type="button"
                onClick={handleBulkEdit}
                disabled={isActionInProgress}
                className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-800 hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                Bulk Edit
              </button>

              <button
                type="button"
                onClick={onClearSelection}
                className="flex items-center p-2 rounded-md text-white hover:bg-sage-700 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuppressedProductsBulkActions;
