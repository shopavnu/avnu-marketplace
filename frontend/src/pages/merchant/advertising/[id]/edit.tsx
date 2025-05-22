import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { useQuery, useMutation } from "@apollo/client";
import {
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  MapPinIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import {
  CampaignType,
  TargetAudience,
  CampaignFormData,
  Product,
  BudgetForecast,
  UpdateAdCampaignInput,
} from "@/types/adCampaigns";
import {
  GET_CAMPAIGN,
  GET_MERCHANT_PRODUCTS,
  GET_BUDGET_FORECAST,
  UPDATE_AD_CAMPAIGN,
} from "@/graphql/adCampaigns";
import ProductSelector from "@/components/merchant/ProductSelector";
import BudgetAllocator from "@/components/merchant/BudgetAllocator";
import DemographicTargeting from "@/components/merchant/DemographicTargeting";

// Demographics options
const ageRanges = ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const genders = ["All", "Male", "Female", "Non-binary"];
const interests = [
  "Sustainable Fashion",
  "Eco-Friendly Products",
  "Environmentalism",
  "Sustainable Living",
  "Ethical Shopping",
  "Zero Waste",
  "Minimalism",
  "Organic Products",
];
const locations = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Germany",
  "France",
  "Global",
];

const EditCampaignPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState<CampaignFormData>({
    name: "",
    description: "",
    type: CampaignType.PRODUCT_PROMOTION,
    startDate: "",
    endDate: "",
    budget: 100,
    targetAudience: TargetAudience.ALL,
    selectedProducts: [],
    selectedAgeRanges: [],
    selectedGenders: ["All"],
    selectedInterests: [],
    selectedLocations: [],
  });

  // Products state
  const [products, setProducts] = useState<Product[]>([]);

  // Query for campaign details
  const { data: campaignData, loading: campaignLoading } = useQuery(
    GET_CAMPAIGN,
    {
      variables: { id, merchantId: "current-merchant-id" }, // Replace with actual merchant ID from context
      skip: !id,
      onCompleted: (data) => {
        if (data?.merchantAdCampaign) {
          const campaign = data.merchantAdCampaign;
          setFormData({
            name: campaign.name,
            description: campaign.description || "",
            type: campaign.type,
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            budget: campaign.budget,
            targetAudience: campaign.targetAudience,
            selectedProducts: campaign.productIds,
            selectedAgeRanges: campaign.targetDemographics || [],
            selectedGenders: ["All"], // Default
            selectedInterests: campaign.targetInterests || [],
            selectedLocations: campaign.targetLocations || [],
          });
          setLoading(false);
        }
      },
      onError: (error) => {
        console.error("Error fetching campaign:", error);
        setLoading(false);
      },
    },
  );

  // Query for merchant products
  const { data: productsData, loading: productsLoading } = useQuery(
    GET_MERCHANT_PRODUCTS,
    {
      variables: { merchantId: "current-merchant-id" }, // Replace with actual merchant ID from context
      onCompleted: (data) => {
        if (data?.merchantProducts) {
          setProducts(data.merchantProducts);
        }
      },
    },
  );

  // Handle input changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle checkbox changes for multi-select options
  const handleCheckboxChange = (
    field: keyof CampaignFormData,
    value: string,
  ) => {
    if (
      field === "selectedAgeRanges" ||
      field === "selectedGenders" ||
      field === "selectedInterests" ||
      field === "selectedLocations" ||
      field === "selectedProducts"
    ) {
      setFormData({
        ...formData,
        [field]: formData[field].includes(value)
          ? formData[field].filter((item) => item !== value)
          : [...formData[field], value],
      });
    }
  };

  // Wrapper function for DemographicTargeting component
  const handleDemographicChange = (field: string, value: string) => {
    handleCheckboxChange(field as keyof CampaignFormData, value);
  };

  // Handle product selection
  const handleProductSelect = (productId: string) => {
    setFormData({
      ...formData,
      selectedProducts: formData.selectedProducts.includes(productId)
        ? formData.selectedProducts.filter((id) => id !== productId)
        : [...formData.selectedProducts, productId],
    });
  };

  // Budget forecast query
  const {
    data: forecastData,
    loading: forecastLoading,
    refetch: refetchForecast,
  } = useQuery(GET_BUDGET_FORECAST, {
    variables: {
      merchantId: "current-merchant-id", // Replace with actual merchant ID from context
      budget: formData.budget,
      campaignType: formData.type,
      targetAudience: formData.targetAudience,
    },
    skip: !formData.budget || !formData.type,
    onCompleted: (data) => {
      if (data?.budgetForecast) {
        // Use budget forecast data if needed
        console.log("Budget forecast:", data.budgetForecast);
      }
    },
  });

  // Update campaign mutation
  const [updateCampaign, { loading: updateLoading }] = useMutation(
    UPDATE_AD_CAMPAIGN,
    {
      onCompleted: (data) => {
        if (data?.updateAdCampaign) {
          // Redirect to campaign detail page on success
          router.push(`/merchant/advertising/${id}`);
        }
      },
      onError: (error) => {
        console.error("Error updating campaign:", error);
        setSubmitting(false);
      },
    },
  );

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Prepare input data for the mutation
      const campaignInput: UpdateAdCampaignInput = {
        name: formData.name,
        description: formData.description,
        type: formData.type,
        productIds: formData.selectedProducts,
        budget: formData.budget,
        targetAudience: formData.targetAudience,
        targetDemographics: formData.selectedAgeRanges,
        targetLocations: formData.selectedLocations,
        targetInterests: formData.selectedInterests,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      // Execute the mutation
      await updateCampaign({
        variables: {
          id,
          merchantId: "current-merchant-id", // Replace with actual merchant ID from context
          input: campaignInput,
        },
      });
    } catch (error) {
      console.error("Error updating campaign:", error);
      setSubmitting(false);
    }
  };

  // Navigate to next step
  const goToNextStep = () => {
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  // Navigate to previous step
  const goToPrevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  // Validate current step
  const isCurrentStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.name.trim() !== "" &&
          formData.startDate !== "" &&
          formData.endDate !== ""
        );
      case 2:
        return formData.selectedProducts.length > 0;
      case 3:
        return formData.budget >= 50; // Minimum budget requirement
      case 4:
        return true; // Demographics are optional
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading campaign data...</p>
            </div>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Campaign | Avnu Merchant Portal</title>
      </Head>
      <MerchantLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center mb-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Campaign
              </h1>
            </div>

            {/* Progress Steps */}
            <div className="mb-8">
              <div className="flex justify-between items-center">
                {[
                  "Campaign Details",
                  "Product Selection",
                  "Budget Allocation",
                  "Targeting",
                ].map((stepName, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        step > index + 1
                          ? "bg-green-500"
                          : step === index + 1
                            ? "bg-blue-600"
                            : "bg-gray-300"
                      } text-white font-medium`}
                    >
                      {step > index + 1 ? "✓" : index + 1}
                    </div>
                    <span
                      className={`mt-2 text-sm ${step === index + 1 ? "text-blue-600 font-medium" : "text-gray-500"}`}
                    >
                      {stepName}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white shadow-sm rounded-lg overflow-hidden"
            >
              {/* Step 1: Campaign Details */}
              {step === 1 && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Campaign Details
                  </h2>

                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Campaign Name*
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="e.g., Summer Collection Promotion"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Describe your campaign objectives and target audience"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Campaign Type*
                      </label>
                      <select
                        id="type"
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value={CampaignType.PRODUCT_PROMOTION}>
                          Product Promotion
                        </option>
                        <option value={CampaignType.RETARGETING}>
                          Retargeting
                        </option>
                        <option value={CampaignType.BRAND_AWARENESS}>
                          Brand Awareness
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="startDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Start Date*
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="startDate"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            required
                            className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="endDate"
                          className="block text-sm font-medium text-gray-700"
                        >
                          End Date*
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="date"
                            id="endDate"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            min={
                              formData.startDate ||
                              new Date().toISOString().split("T")[0]
                            }
                            required
                            className="block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Product Selection */}
              {step === 2 && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Product Selection
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Select the products you want to promote in this campaign.
                    You can select multiple products.
                  </p>

                  <ProductSelector
                    products={products}
                    selectedProductIds={formData.selectedProducts}
                    onProductSelect={handleProductSelect}
                    loading={productsLoading}
                  />

                  {formData.selectedProducts.length === 0 && (
                    <p className="mt-4 text-sm text-red-500">
                      Please select at least one product for your campaign.
                    </p>
                  )}
                </div>
              )}

              {/* Step 3: Budget Allocation */}
              {step === 3 && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Budget Allocation
                  </h2>

                  <BudgetAllocator
                    budget={formData.budget}
                    onBudgetChange={(budget) => {
                      setFormData((prev) => ({ ...prev, budget }));
                      refetchForecast({
                        variables: {
                          budget,
                          campaignType: formData.type,
                          targetAudience: formData.targetAudience,
                        },
                      });
                    }}
                    forecast={forecastData?.budgetForecast}
                    loading={forecastLoading}
                  />
                </div>
              )}

              {/* Step 4: Demographic Targeting */}
              {step === 4 && (
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Demographic Targeting
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Refine your audience targeting to reach the right customers.
                    All fields are optional.
                  </p>

                  <DemographicTargeting
                    ageRanges={ageRanges}
                    genders={genders}
                    interests={interests}
                    locations={locations}
                    selectedAgeRanges={formData.selectedAgeRanges}
                    selectedGenders={formData.selectedGenders}
                    selectedInterests={formData.selectedInterests}
                    selectedLocations={formData.selectedLocations}
                    onCheckboxChange={handleDemographicChange}
                  />
                </div>
              )}

              {/* Form Navigation Buttons */}
              <div className="px-6 py-4 bg-gray-50 flex justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Back
                  </button>
                ) : (
                  <div></div> // Empty div to maintain flex spacing
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    disabled={!isCurrentStepValid()}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isCurrentStepValid()
                        ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        : "bg-blue-300 cursor-not-allowed"
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      submitting
                        ? "bg-blue-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    }`}
                  >
                    {submitting ? "Saving Changes..." : "Save Changes"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default EditCampaignPage;
