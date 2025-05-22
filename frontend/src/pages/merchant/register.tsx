import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  BuildingStorefrontIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const MerchantRegisterPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // User information
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Merchant information
    merchantName: "",
    merchantDescription: "",
    website: "",
    categories: [] as string[],
    values: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Available categories and values for selection
  const availableCategories = [
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

  const availableValues = [
    "Eco-friendly",
    "Sustainable",
    "Fair Trade",
    "Handcrafted",
    "Vegan",
    "Organic",
    "Local",
    "Women-owned",
    "BIPOC-owned",
    "LGBTQ+-owned",
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    arrayName: "categories" | "values",
  ) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        [arrayName]: [...prev[arrayName], value],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [arrayName]: prev[arrayName].filter((item) => item !== value),
      }));
    }
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError("Please fill in all required fields");
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!formData.merchantName) {
      setError("Please provide a name for your store");
      return false;
    }

    if (formData.categories.length === 0) {
      setError("Please select at least one category");
      return false;
    }

    setError("");
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      handleNextStep();
      return;
    }

    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // This would be replaced with an actual API call
      console.log("Registering merchant with:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect to merchant dashboard on success
      router.push("/merchant/dashboard");
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <BuildingStorefrontIcon className="h-12 w-12 text-sage" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-charcoal">
          Become a Merchant
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our marketplace and start selling your products
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Step 1: User Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex justify-between gap-4">
                  <div className="flex-1">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name *
                    </label>
                    <div className="mt-1">
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name *
                    </label>
                    <div className="mt-1">
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address *
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password *
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm Password *
                  </label>
                  <div className="mt-1">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Merchant Information */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="merchantName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Store Name *
                  </label>
                  <div className="mt-1">
                    <input
                      id="merchantName"
                      name="merchantName"
                      type="text"
                      required
                      value={formData.merchantName}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="merchantDescription"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Store Description
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="merchantDescription"
                      name="merchantDescription"
                      rows={3}
                      value={formData.merchantDescription}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                      placeholder="Tell customers about your brand and what makes your products special..."
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Website (optional)
                  </label>
                  <div className="mt-1">
                    <input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sage focus:border-sage sm:text-sm"
                      placeholder="https://yourbrand.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Categories *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          id={`category-${category}`}
                          name="categories"
                          type="checkbox"
                          value={category}
                          checked={formData.categories.includes(category)}
                          onChange={(e) =>
                            handleCheckboxChange(e, "categories")
                          }
                          className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand Values (optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableValues.map((value) => (
                      <div key={value} className="flex items-center">
                        <input
                          id={`value-${value}`}
                          name="values"
                          type="checkbox"
                          value={value}
                          checked={formData.values.includes(value)}
                          onChange={(e) => handleCheckboxChange(e, "values")}
                          className="h-4 w-4 text-sage focus:ring-sage border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`value-${value}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {value}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="flex items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                >
                  <ArrowLeftIcon className="mr-2 h-4 w-4" />
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage disabled:opacity-50 disabled:cursor-not-allowed ${step === 1 ? "ml-auto" : "w-32"}`}
              >
                {isLoading
                  ? "Processing..."
                  : step === 1
                    ? "Continue"
                    : "Register"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/merchant/login"
                className="font-medium text-sage hover:text-sage/80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantRegisterPage;
