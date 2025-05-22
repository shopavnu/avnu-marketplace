import { useState, useEffect } from "react";
import {
  TagIcon,
  LinkIcon,
  GlobeAltIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface ProductMetadata {
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  keywords: string[];
  customAttributes: {
    key: string;
    value: string;
  }[];
  relatedProducts: string[];
}

interface ProductMetadataEditorProps {
  productId: string;
  initialMetadata: ProductMetadata;
  onSave: (productId: string, metadata: ProductMetadata) => void;
}

const ProductMetadataEditor = ({
  productId,
  initialMetadata,
  onSave,
}: ProductMetadataEditorProps) => {
  const [metadata, setMetadata] = useState<ProductMetadata>(initialMetadata);
  const [newKeyword, setNewKeyword] = useState("");
  const [newAttributeKey, setNewAttributeKey] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [newRelatedProduct, setNewRelatedProduct] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Character limits for SEO fields
  const META_TITLE_LIMIT = 60;
  const META_DESCRIPTION_LIMIT = 160;

  // Validate metadata fields
  const validateMetadata = () => {
    const newErrors: Record<string, string> = {};

    if (!metadata.metaTitle.trim()) {
      newErrors.metaTitle = "Meta title is required";
    } else if (metadata.metaTitle.length > META_TITLE_LIMIT) {
      newErrors.metaTitle = `Meta title must be ${META_TITLE_LIMIT} characters or less`;
    }

    if (!metadata.metaDescription.trim()) {
      newErrors.metaDescription = "Meta description is required";
    } else if (metadata.metaDescription.length > META_DESCRIPTION_LIMIT) {
      newErrors.metaDescription = `Meta description must be ${META_DESCRIPTION_LIMIT} characters or less`;
    }

    if (!metadata.urlSlug.trim()) {
      newErrors.urlSlug = "URL slug is required";
    } else if (!/^[a-z0-9-]+$/.test(metadata.urlSlug)) {
      newErrors.urlSlug =
        "URL slug can only contain lowercase letters, numbers, and hyphens";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle URL slug change (format it correctly)
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    setMetadata((prev) => ({
      ...prev,
      urlSlug: value,
    }));
  };

  // Add a new keyword
  const handleAddKeyword = () => {
    if (!newKeyword.trim()) return;

    if (!metadata.keywords.includes(newKeyword.trim())) {
      setMetadata((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
    }

    setNewKeyword("");
  };

  // Remove a keyword
  const handleRemoveKeyword = (keyword: string) => {
    setMetadata((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  // Add a new custom attribute
  const handleAddAttribute = () => {
    if (!newAttributeKey.trim() || !newAttributeValue.trim()) return;

    // Check if the key already exists
    const keyExists = metadata.customAttributes.some(
      (attr) => attr.key.toLowerCase() === newAttributeKey.trim().toLowerCase(),
    );

    if (!keyExists) {
      setMetadata((prev) => ({
        ...prev,
        customAttributes: [
          ...prev.customAttributes,
          { key: newAttributeKey.trim(), value: newAttributeValue.trim() },
        ],
      }));

      setNewAttributeKey("");
      setNewAttributeValue("");
    }
  };

  // Remove a custom attribute
  const handleRemoveAttribute = (key: string) => {
    setMetadata((prev) => ({
      ...prev,
      customAttributes: prev.customAttributes.filter(
        (attr) => attr.key !== key,
      ),
    }));
  };

  // Add a related product
  const handleAddRelatedProduct = () => {
    if (!newRelatedProduct.trim()) return;

    if (!metadata.relatedProducts.includes(newRelatedProduct.trim())) {
      setMetadata((prev) => ({
        ...prev,
        relatedProducts: [...prev.relatedProducts, newRelatedProduct.trim()],
      }));
    }

    setNewRelatedProduct("");
  };

  // Remove a related product
  const handleRemoveRelatedProduct = (productId: string) => {
    setMetadata((prev) => ({
      ...prev,
      relatedProducts: prev.relatedProducts.filter((id) => id !== productId),
    }));
  };

  // Save metadata changes
  const handleSave = async () => {
    if (!validateMetadata()) return;

    setIsSaving(true);
    try {
      await onSave(productId, metadata);
      // Show success message (in a real app)
    } catch (error) {
      console.error("Error saving metadata:", error);
      // Show error message (in a real app)
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Product Metadata & SEO
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Optimize your product for search engines and manage additional
          metadata.
        </p>
      </div>

      <div className="px-4 py-5 sm:p-6 space-y-6">
        {/* SEO Section */}
        <div>
          <h4 className="text-base font-medium text-gray-900 mb-4">
            Search Engine Optimization
          </h4>

          <div className="space-y-4">
            {/* Meta Title */}
            <div>
              <label
                htmlFor="metaTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Meta Title
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  name="metaTitle"
                  id="metaTitle"
                  value={metadata.metaTitle}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.metaTitle ? "border-red-300" : ""
                  }`}
                  placeholder="Enter meta title (60 characters max)"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span
                    className={`text-sm ${
                      metadata.metaTitle.length > META_TITLE_LIMIT
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {metadata.metaTitle.length}/{META_TITLE_LIMIT}
                  </span>
                </div>
              </div>
              {errors.metaTitle && (
                <p className="mt-2 text-sm text-red-600">{errors.metaTitle}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                The title that appears in search engine results. Keep it under
                60 characters.
              </p>
            </div>

            {/* Meta Description */}
            <div>
              <label
                htmlFor="metaDescription"
                className="block text-sm font-medium text-gray-700"
              >
                Meta Description
              </label>
              <div className="mt-1 relative">
                <textarea
                  name="metaDescription"
                  id="metaDescription"
                  rows={3}
                  value={metadata.metaDescription}
                  onChange={handleInputChange}
                  className={`shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md ${
                    errors.metaDescription ? "border-red-300" : ""
                  }`}
                  placeholder="Enter meta description (160 characters max)"
                />
                <div className="absolute bottom-2 right-2 pr-1 flex items-center pointer-events-none">
                  <span
                    className={`text-sm ${
                      metadata.metaDescription.length > META_DESCRIPTION_LIMIT
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {metadata.metaDescription.length}/{META_DESCRIPTION_LIMIT}
                  </span>
                </div>
              </div>
              {errors.metaDescription && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.metaDescription}
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                The description that appears in search engine results. Keep it
                under 160 characters.
              </p>
            </div>

            {/* URL Slug */}
            <div>
              <label
                htmlFor="urlSlug"
                className="block text-sm font-medium text-gray-700"
              >
                URL Slug
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  <LinkIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                  avnu.com/products/
                </span>
                <input
                  type="text"
                  name="urlSlug"
                  id="urlSlug"
                  value={metadata.urlSlug}
                  onChange={handleSlugChange}
                  className={`flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-sage focus:border-sage sm:text-sm border-gray-300 ${
                    errors.urlSlug ? "border-red-300" : ""
                  }`}
                  placeholder="product-url-slug"
                />
              </div>
              {errors.urlSlug && (
                <p className="mt-2 text-sm text-red-600">{errors.urlSlug}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                The URL-friendly version of your product name. Use lowercase
                letters, numbers, and hyphens only.
              </p>
            </div>

            {/* Keywords */}
            <div>
              <label
                htmlFor="keywords"
                className="block text-sm font-medium text-gray-700"
              >
                Keywords
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="newKeyword"
                  id="newKeyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-sage focus:border-sage sm:text-sm border-gray-300"
                  placeholder="Enter a keyword"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddKeyword}
                  className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                >
                  Add
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Keywords help customers find your product in search results.
              </p>

              {metadata.keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {metadata.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sage/10 text-sage"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => handleRemoveKeyword(keyword)}
                        className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-sage/60 hover:text-sage/80 focus:outline-none"
                      >
                        <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                        <span className="sr-only">Remove {keyword}</span>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Social Media Preview */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">
                Social Media Preview
              </h5>
              <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                <div className="max-w-md">
                  <div className="rounded-md overflow-hidden border border-gray-200 bg-white">
                    <div className="h-40 bg-gray-200 flex items-center justify-center">
                      <GlobeAltIcon
                        className="h-10 w-10 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-blue-600 truncate">
                        {metadata.metaTitle || "Product Title"}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        avnu.com/products/{metadata.urlSlug || "product-slug"}
                      </p>
                      <p className="mt-1 text-xs text-gray-700 line-clamp-2">
                        {metadata.metaDescription ||
                          "Product description will appear here. Make sure to provide a compelling description that encourages clicks."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Attributes Section */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-base font-medium text-gray-900 mb-4">
            Custom Attributes
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="newAttributeKey"
                  className="block text-sm font-medium text-gray-700"
                >
                  Attribute Name
                </label>
                <input
                  type="text"
                  name="newAttributeKey"
                  id="newAttributeKey"
                  value={newAttributeKey}
                  onChange={(e) => setNewAttributeKey(e.target.value)}
                  className="mt-1 shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="e.g., Material, Color, Size"
                />
              </div>

              <div>
                <label
                  htmlFor="newAttributeValue"
                  className="block text-sm font-medium text-gray-700"
                >
                  Attribute Value
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    name="newAttributeValue"
                    id="newAttributeValue"
                    value={newAttributeValue}
                    onChange={(e) => setNewAttributeValue(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-sage focus:border-sage sm:text-sm border-gray-300"
                    placeholder="e.g., Cotton, Blue, Large"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttribute}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
                  >
                    <PlusIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Add Attribute</span>
                  </button>
                </div>
              </div>
            </div>

            {metadata.customAttributes.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">
                  Current Attributes
                </h5>
                <div className="bg-gray-50 rounded-md overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                    {metadata.customAttributes.map((attr) => (
                      <li
                        key={attr.key}
                        className="px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {attr.key}
                          </p>
                          <p className="text-sm text-gray-500">{attr.value}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(attr.key)}
                          className="inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none"
                        >
                          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Remove {attr.key}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="pt-6 border-t border-gray-200">
          <h4 className="text-base font-medium text-gray-900 mb-4">
            Related Products
          </h4>

          <div className="space-y-4">
            <div className="flex rounded-md shadow-sm">
              <input
                type="text"
                name="newRelatedProduct"
                id="newRelatedProduct"
                value={newRelatedProduct}
                onChange={(e) => setNewRelatedProduct(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md focus:ring-sage focus:border-sage sm:text-sm border-gray-300"
                placeholder="Enter product ID"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRelatedProduct();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddRelatedProduct}
                className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm hover:bg-gray-100"
              >
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Link related products to encourage cross-selling.
            </p>

            {metadata.relatedProducts.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {metadata.relatedProducts.map((productId) => (
                  <span
                    key={productId}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    <TagIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                    {productId}
                    <button
                      type="button"
                      onClick={() => handleRemoveRelatedProduct(productId)}
                      className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none"
                    >
                      <XMarkIcon className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Remove {productId}</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Metadata"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductMetadataEditor;
