import { useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Image from "next/image";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MerchantLayout from "@/components/merchant/MerchantLayout";

const CreateProductPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    barcode: "",
    inventory: "0",
    weight: "",
    length: "",
    width: "",
    height: "",
    category: "",
    tags: "",
    status: "draft",
    featured: false,
    taxable: true,
    shippingRequired: true,
  });

  // Available categories for selection
  const categories = [
    "Apparel",
    "Accessories",
    "Home Goods",
    "Beauty",
    "Wellness",
    "Food & Drink",
    "Art",
    "Jewelry",
    "Sustainable",
    "Handmade",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;

    // Handle checkbox inputs
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    }
    // Handle number inputs
    else if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : value,
      }));
    }
    // Handle all other inputs
    else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Convert FileList to array and process each file
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would be replaced with an actual API call
      console.log("Creating product with:", formData);
      console.log("Product images:", previewImages);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to products page on success
      router.push("/merchant/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("An error occurred while creating the product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Add New Product | Merchant Portal | av|nu</title>
        <meta
          name="description"
          content="Add a new product to your av|nu store"
        />
      </Head>

      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Back</span>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Add New Product
              </h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-8">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Basic Information
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Product details and description.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Name *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter product name"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description *
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      required
                      value={formData.description}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Describe your product..."
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Brief description of your product. This will be displayed on
                    the product page.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Price *
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="price"
                        id="price"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={handleChange}
                        className="focus:ring-sage focus:border-sage block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="compareAtPrice"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Compare at Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="compareAtPrice"
                        id="compareAtPrice"
                        min="0"
                        step="0.01"
                        value={formData.compareAtPrice}
                        onChange={handleChange}
                        className="focus:ring-sage focus:border-sage block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Original price, if this product is on sale.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="sku"
                      className="block text-sm font-medium text-gray-700"
                    >
                      SKU
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="sku"
                        id="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="SKU-12345"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="barcode"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Barcode (ISBN, UPC, GTIN, etc.)
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="barcode"
                        id="barcode"
                        value={formData.barcode}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="123456789012"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Inventory & Shipping */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Inventory & Shipping
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage inventory and shipping details.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="inventory"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Inventory Quantity *
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="inventory"
                        id="inventory"
                        required
                        min="0"
                        value={formData.inventory}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Weight (in kg)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        min="0"
                        step="0.01"
                        value={formData.weight}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="length"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Length (cm)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="length"
                        id="length"
                        min="0"
                        step="0.1"
                        value={formData.length}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="width"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Width (cm)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="width"
                        id="width"
                        min="0"
                        step="0.1"
                        value={formData.width}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Height (cm)
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="height"
                        id="height"
                        min="0"
                        step="0.1"
                        value={formData.height}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="shippingRequired"
                        name="shippingRequired"
                        type="checkbox"
                        checked={formData.shippingRequired}
                        onChange={handleChange}
                        className="focus:ring-sage h-4 w-4 text-sage border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="shippingRequired"
                        className="font-medium text-gray-700"
                      >
                        This product requires shipping
                      </label>
                    </div>
                  </div>

                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="taxable"
                        name="taxable"
                        type="checkbox"
                        checked={formData.taxable}
                        onChange={handleChange}
                        className="focus:ring-sage h-4 w-4 text-sage border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="taxable"
                        className="font-medium text-gray-700"
                      >
                        Charge tax on this product
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Organization
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Categorize and tag your product.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6 space-y-6">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category *
                  </label>
                  <div className="mt-1">
                    <select
                      id="category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tags"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Tags
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="tags"
                      id="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="eco-friendly, sustainable, organic, etc."
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Separate tags with commas.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Status *
                  </label>
                  <div className="mt-1">
                    <select
                      id="status"
                      name="status"
                      required
                      value={formData.status}
                      onChange={handleChange}
                      className="shadow-sm focus:ring-sage focus:border-sage block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Draft products are not visible to customers.
                  </p>
                </div>

                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="featured"
                      name="featured"
                      type="checkbox"
                      checked={formData.featured}
                      onChange={handleChange}
                      className="focus:ring-sage h-4 w-4 text-sage border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="featured"
                      className="font-medium text-gray-700"
                    >
                      Feature this product
                    </label>
                    <p className="text-gray-500">
                      Featured products are displayed prominently on your store.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Images
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload product images.
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <PhotoIcon
                      className="mx-auto h-12 w-12 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="images"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-sage hover:text-sage/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sage"
                      >
                        <span>Upload files</span>
                        <input
                          id="images"
                          name="images"
                          type="file"
                          multiple
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {previewImages.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {previewImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                          <Image
                            src={image}
                            alt={`Preview ${index + 1}`}
                            width={200}
                            height={200}
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                          >
                            <span className="sr-only">Remove image</span>
                            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-sage text-white text-xs px-2 py-1 rounded">
                            Main
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </MerchantLayout>
    </>
  );
};

export default CreateProductPage;
