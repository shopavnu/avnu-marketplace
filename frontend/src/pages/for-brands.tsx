import { useState } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { XCircleIcon } from "@heroicons/react/24/outline";

// Define platforms and categories
const platforms = [
  { id: "shopify", name: "Shopify" },
  { id: "woocommerce", name: "WooCommerce" },
  { id: "squarespace", name: "Squarespace" },
  { id: "bigcommerce", name: "BigCommerce" },
  { id: "etsy", name: "Etsy" },
  { id: "other", name: "Other" },
];

const categories = [
  { id: "home", name: "Home & Decor" },
  { id: "fashion", name: "Fashion & Apparel" },
  { id: "beauty", name: "Beauty & Personal Care" },
  { id: "jewelry", name: "Jewelry & Accessories" },
  { id: "art", name: "Art & Prints" },
  { id: "food", name: "Food & Beverages" },
  { id: "wellness", name: "Health & Wellness" },
  { id: "pets", name: "Pets" },
  { id: "kids", name: "Kids & Baby" },
  { id: "tech", name: "Tech & Gadgets" },
  { id: "outdoors", name: "Outdoors & Adventure" },
  { id: "other", name: "Other" },
];

// Define shipping options
const shippingOptions = [
  { id: "always-free", name: "Always Free Shipping" },
  { id: "threshold", name: "Free Shipping Above Threshold" },
  { id: "paid", name: "Paid Shipping" },
];

// Define values/causes
const causes = [
  { id: "sustainable", name: "Sustainability" },
  { id: "handmade", name: "Handmade/Artisanal" },
  { id: "local", name: "Local Production" },
  { id: "ethical", name: "Ethical Production" },
  { id: "vegan", name: "Vegan/Cruelty-Free" },
  { id: "minority-owned", name: "Minority-Owned" },
  { id: "women-owned", name: "Women-Owned" },
  { id: "lgbtq-owned", name: "LGBTQ+-Owned" },
  { id: "give-back", name: "Gives Back to Community" },
  { id: "organic", name: "Organic Materials" },
];

export default function ForBrands() {
  // Form state
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    website: "",
    instagram: "",
    description: "",
    platform: "",
    categories: [] as string[],
    shippingOption: "",
    shippingThreshold: "",
    causes: [] as string[],
    additionalInfo: "",
  });

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    array: string[],
  ) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked
        ? [...array, value]
        : array.filter((item) => item !== value),
    }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validate form
    if (
      !formData.businessName ||
      !formData.email ||
      !formData.website ||
      formData.categories.length === 0
    ) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // In a real app, you would send the form data to your backend here
      console.log("Form submitted:", formData);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <Head>
        <title>For Brands | av | nu - Curated Independent Brands</title>
        <meta
          name="description"
          content="Join av | nu marketplace as a brand partner"
        />
      </Head>

      <main>
        {/* Hero Section */}
        <section className="relative bg-sage/10 py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <motion.h1
                  className="font-montserrat text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  Join the av | nu Family
                </motion.h1>
                <motion.p
                  className="text-lg text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  We partner with exceptional independent brands that share our
                  values of quality, sustainability, and authentic
                  craftsmanship.
                </motion.p>
                <motion.div
                  className="space-y-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-sage mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Reach a curated audience of discerning shoppers
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-sage mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Showcase your brand story and values
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-sage mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Seamless integration with your existing e-commerce
                      platform
                    </p>
                  </div>
                  <div className="flex items-start">
                    <CheckCircleIcon className="w-6 h-6 text-sage mr-2 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">
                      Join a community of like-minded independent creators
                    </p>
                  </div>
                </motion.div>
              </div>
              <div className="md:w-1/2 relative">
                <motion.div
                  className="relative h-64 md:h-96 w-full rounded-2xl overflow-hidden shadow-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Image
                    src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&q=80&fit=crop&w=1200"
                    alt="Brand partners at av | nu"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Application Form Section */}
        <section className="py-16 max-w-4xl mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="font-montserrat text-3xl font-bold text-charcoal mb-4">
              Apply to Join
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete the form below to apply to become a brand partner. Our
              team will review your application and get back to you within 5
              business days.
            </p>
          </div>

          {isSubmitted ? (
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-md text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-charcoal mb-4">
                Application Submitted!
              </h3>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in joining av | nu. We&apos;ve
                received your application and will review it shortly. You can
                expect to hear back from us within 5 business days.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="bg-sage text-white px-6 py-3 rounded-full font-medium hover:bg-sage/90 transition-colors"
              >
                Submit Another Application
              </button>
            </motion.div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start">
                  <XCircleIcon className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contactName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Website URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    required
                    placeholder="https://"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="instagram"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    id="instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@yourbrand"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Brand Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell us about your brand, mission, and what makes your products unique..."
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                ></textarea>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="platform"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  E-commerce Platform <span className="text-red-500">*</span>
                </label>
                <select
                  id="platform"
                  name="platform"
                  value={formData.platform}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                >
                  <option value="">Select your platform</option>
                  {platforms.map((platform) => (
                    <option key={platform.id} value={platform.id}>
                      {platform.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Product Categories <span className="text-red-500">*</span>
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${category.id}`}
                        name="categories"
                        value={category.id}
                        checked={formData.categories.includes(category.id)}
                        onChange={(e) =>
                          handleCheckboxChange(e, formData.categories)
                        }
                        className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Options <span className="text-red-500">*</span>
                </p>
                <div className="space-y-2">
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        id={`shipping-${option.id}`}
                        name="shippingOption"
                        value={option.id}
                        checked={formData.shippingOption === option.id}
                        onChange={handleChange}
                        className="h-4 w-4 text-sage focus:ring-sage border-gray-300"
                      />
                      <label
                        htmlFor={`shipping-${option.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {option.name}
                      </label>
                    </div>
                  ))}
                </div>

                {formData.shippingOption === "threshold" && (
                  <div className="mt-3 ml-6">
                    <label
                      htmlFor="shippingThreshold"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Free Shipping Threshold ($)
                    </label>
                    <input
                      type="number"
                      id="shippingThreshold"
                      name="shippingThreshold"
                      value={formData.shippingThreshold}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      placeholder="50.00"
                      className="w-full max-w-xs px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div className="mb-8">
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Values & Causes (Select all that apply)
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {causes.map((cause) => (
                    <div key={cause.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`cause-${cause.id}`}
                        name="causes"
                        value={cause.id}
                        checked={formData.causes.includes(cause.id)}
                        onChange={(e) =>
                          handleCheckboxChange(e, formData.causes)
                        }
                        className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                      />
                      <label
                        htmlFor={`cause-${cause.id}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {cause.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label
                  htmlFor="additionalInfo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Additional Information
                </label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Anything else you'd like us to know about your brand?"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-sage focus:border-transparent"
                ></textarea>
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-full font-medium text-white transition-colors ${
                    isSubmitting
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-sage hover:bg-sage/90"
                  }`}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </motion.form>
          )}
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-sage/5">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="font-montserrat text-3xl font-bold text-charcoal mb-8 text-center">
              Frequently Asked Questions
            </h2>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-montserrat text-xl font-medium text-charcoal mb-2">
                  What are the requirements to join av | nu?
                </h3>
                <p className="text-gray-600">
                  We look for brands that align with our values of quality,
                  sustainability, and authentic craftsmanship. Your products
                  should be well-designed, thoughtfully made, and offer
                  something unique to our customers.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-montserrat text-xl font-medium text-charcoal mb-2">
                  How does the integration process work?
                </h3>
                <p className="text-gray-600">
                  We integrate directly with your existing e-commerce platform
                  (Shopify, WooCommerce, etc.). This allows us to showcase your
                  products while you maintain control of inventory, fulfillment,
                  and customer service.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-montserrat text-xl font-medium text-charcoal mb-2">
                  What are the fees associated with joining?
                </h3>
                <p className="text-gray-600">
                  We operate on a commission-based model, taking a small
                  percentage of sales generated through our platform. There are
                  no upfront costs or monthly fees to join. We only succeed when
                  you succeed.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="font-montserrat text-xl font-medium text-charcoal mb-2">
                  How long does the application process take?
                </h3>
                <p className="text-gray-600">
                  After you submit your application, our team will review it
                  within 5 business days. If approved, we&apos;ll schedule an
                  onboarding call to discuss next steps and begin the
                  integration process.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
