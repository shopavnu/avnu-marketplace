import { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  CheckIcon,
  XMarkIcon,
  FolderIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface BulkOperationsToolbarProps {
  selectedProductIds: string[];
  onToggleVisibility: (productIds: string[], visible: boolean) => void;
  onAssignCategory: (productIds: string[], categoryId: string) => void;
  onClearSelection: () => void;
}

const BulkOperationsToolbar = ({
  selectedProductIds,
  onToggleVisibility,
  onAssignCategory,
  onClearSelection,
}: BulkOperationsToolbarProps) => {
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock categories - in a real app, these would come from an API
  const categories = [
    { id: "cat-1", name: "Apparel" },
    { id: "cat-2", name: "Accessories" },
    { id: "cat-3", name: "Home Goods" },
    { id: "cat-4", name: "Beauty" },
    { id: "cat-5", name: "Wellness" },
    { id: "cat-6", name: "Food & Drink" },
    { id: "cat-7", name: "Art" },
    { id: "cat-8", name: "Jewelry" },
  ];

  // Handle visibility toggle
  const handleToggleVisibility = async (visible: boolean) => {
    setIsProcessing(true);
    try {
      await onToggleVisibility(selectedProductIds, visible);
      setIsVisibilityMenuOpen(false);
    } catch (error: unknown) {
      console.error("Error toggling visibility:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle category assignment
  const handleAssignCategory = async (categoryId: string) => {
    setIsProcessing(true);
    try {
      await onAssignCategory(selectedProductIds, categoryId);
      setIsCategoryMenuOpen(false);
    } catch (error: unknown) {
      console.error("Error assigning category:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (selectedProductIds.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-x-0 pb-2 sm:pb-5 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-sage shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-sage-dark">
                <CheckIcon className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
              <p className="ml-3 font-medium text-white truncate">
                <span className="md:hidden">
                  {selectedProductIds.length} selected
                </span>
                <span className="hidden md:inline">
                  {selectedProductIds.length} product
                  {selectedProductIds.length !== 1 ? "s" : ""} selected
                </span>
              </p>
            </div>

            <div className="flex-shrink-0 flex items-center space-x-2">
              {/* Visibility Toggle Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-sage bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                  onClick={() => setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
                  disabled={isProcessing}
                >
                  <EyeIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Visibility
                </button>

                {isVisibilityMenuOpen && (
                  <div className="origin-bottom-right absolute right-0 bottom-10 mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button
                        type="button"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleToggleVisibility(true)}
                      >
                        <EyeIcon
                          className="mr-3 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Make Visible
                      </button>
                      <button
                        type="button"
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => handleToggleVisibility(false)}
                      >
                        <EyeSlashIcon
                          className="mr-3 h-5 w-5 text-gray-400"
                          aria-hidden="true"
                        />
                        Make Hidden
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Assignment Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-sage bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  disabled={isProcessing}
                >
                  <FolderIcon
                    className="-ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  Assign Category
                </button>

                {isCategoryMenuOpen && (
                  <div className="origin-bottom-right absolute right-0 bottom-10 mb-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none max-h-60 overflow-y-auto">
                    <div className="py-1">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => handleAssignCategory(category.id)}
                        >
                          <TagIcon
                            className="mr-3 h-5 w-5 text-gray-400"
                            aria-hidden="true"
                          />
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Clear Selection Button */}
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage-dark hover:bg-sage-dark/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                onClick={onClearSelection}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ArrowPathIcon
                    className="animate-spin -ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                ) : (
                  <XMarkIcon
                    className="-ml-1 mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                )}
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperationsToolbar;
