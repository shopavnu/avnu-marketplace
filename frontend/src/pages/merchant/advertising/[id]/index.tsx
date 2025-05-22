import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  PauseIcon,
  PlayIcon,
  ChartBarIcon,
  CalendarIcon,
  TagIcon,
  UserGroupIcon,
  MapPinIcon,
  HeartIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/outline";
import MerchantLayout from "@/components/merchant/MerchantLayout";
import {
  AdCampaign,
  CampaignStatus,
  CampaignType,
  TargetAudience,
  Product,
} from "@/types/adCampaigns";
import {
  GET_CAMPAIGN,
  GET_MERCHANT_PRODUCTS,
  UPDATE_CAMPAIGN_STATUS,
  DELETE_AD_CAMPAIGN,
} from "@/graphql/adCampaigns";

// Campaign performance timeframe options
const timeframeOptions = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "total", label: "Total" },
];

// Mock performance data for charts
const mockPerformanceData = {
  daily: [
    {
      date: "2025-04-01",
      impressions: 520,
      clicks: 28,
      conversions: 2,
      spent: 10.45,
    },
    {
      date: "2025-04-02",
      impressions: 480,
      clicks: 25,
      conversions: 2,
      spent: 9.75,
    },
    {
      date: "2025-04-03",
      impressions: 510,
      clicks: 30,
      conversions: 3,
      spent: 11.2,
    },
    {
      date: "2025-04-04",
      impressions: 550,
      clicks: 32,
      conversions: 2,
      spent: 12.1,
    },
    {
      date: "2025-04-05",
      impressions: 490,
      clicks: 26,
      conversions: 2,
      spent: 10.25,
    },
    {
      date: "2025-04-06",
      impressions: 470,
      clicks: 24,
      conversions: 1,
      spent: 9.5,
    },
    {
      date: "2025-04-07",
      impressions: 530,
      clicks: 31,
      conversions: 3,
      spent: 11.8,
    },
    {
      date: "2025-04-08",
      impressions: 560,
      clicks: 35,
      conversions: 3,
      spent: 12.9,
    },
    {
      date: "2025-04-09",
      impressions: 540,
      clicks: 33,
      conversions: 2,
      spent: 12.3,
    },
    {
      date: "2025-04-10",
      impressions: 580,
      clicks: 36,
      conversions: 3,
      spent: 13.2,
    },
    {
      date: "2025-04-11",
      impressions: 600,
      clicks: 38,
      conversions: 4,
      spent: 14.5,
    },
    {
      date: "2025-04-12",
      impressions: 590,
      clicks: 37,
      conversions: 3,
      spent: 13.9,
    },
    {
      date: "2025-04-13",
      impressions: 570,
      clicks: 34,
      conversions: 3,
      spent: 12.8,
    },
    {
      date: "2025-04-14",
      impressions: 610,
      clicks: 39,
      conversions: 4,
      spent: 14.75,
    },
    {
      date: "2025-04-15",
      impressions: 630,
      clicks: 42,
      conversions: 5,
      spent: 15.9,
    },
  ],
};

const CampaignDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [performanceTimeframe, setPerformanceTimeframe] = useState("daily");

  // Query for campaign details
  const {
    data: campaignData,
    loading: campaignLoading,
    refetch: refetchCampaign,
  } = useQuery(GET_CAMPAIGN, {
    variables: { id },
    skip: !id,
    onCompleted: (data) => {
      if (data?.adCampaign) {
        setCampaign(data.adCampaign);
        setLoading(false);
      }
    },
    onError: (error) => {
      console.error("Error fetching campaign:", error);
      setLoading(false);
    },
  });

  // Query for products
  const { data: productsData, loading: productsLoading } = useQuery(
    GET_MERCHANT_PRODUCTS,
    {
      onCompleted: (data) => {
        if (data?.merchantProducts && campaign) {
          // Filter products to only those in the campaign
          const campaignProducts = data.merchantProducts.filter((p: Product) =>
            campaign.productIds.includes(p.id),
          );
          setSelectedProducts(campaignProducts);
        }
      },
    },
  );

  // Mutation for updating campaign status
  const [updateCampaignStatus, { loading: statusUpdateLoading }] = useMutation(
    UPDATE_CAMPAIGN_STATUS,
    {
      onCompleted: (data) => {
        if (data?.updateCampaignStatus) {
          setCampaign(data.updateCampaignStatus);
        }
      },
      onError: (error) => {
        console.error("Error updating campaign status:", error);
      },
    },
  );

  // Mutation for deleting a campaign
  const [deleteCampaign, { loading: deleteLoading }] = useMutation(
    DELETE_AD_CAMPAIGN,
    {
      onCompleted: () => {
        // Redirect to campaigns list on success
        router.push("/merchant/advertising");
      },
      onError: (error) => {
        console.error("Error deleting campaign:", error);
        setConfirmDelete(false);
      },
    },
  );

  const handleDeleteCampaign = () => {
    if (!campaign) return;

    deleteCampaign({
      variables: {
        id: campaign.id,
      },
    });
  };

  const handleStatusChange = (newStatus: "pause" | "resume") => {
    if (!campaign) return;

    const newStatusValue =
      newStatus === "resume" ? CampaignStatus.ACTIVE : CampaignStatus.PAUSED;

    updateCampaignStatus({
      variables: {
        id: campaign.id,
        status: newStatusValue,
      },
    });
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case CampaignStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case CampaignStatus.PAUSED:
        return "bg-yellow-100 text-yellow-800";
      case CampaignStatus.SCHEDULED:
        return "bg-blue-100 text-blue-800";
      case CampaignStatus.DRAFT:
        return "bg-gray-100 text-gray-800";
      case CampaignStatus.COMPLETED:
      case CampaignStatus.ENDED:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <MerchantLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-500">Loading campaign details...</p>
            </div>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  if (!campaign) {
    return (
      <MerchantLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex items-center justify-center h-64 flex-col">
              <p className="text-gray-500 mb-4">Campaign not found.</p>
              <Link
                href="/merchant/advertising"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Back to Campaigns
              </Link>
            </div>
          </div>
        </div>
      </MerchantLayout>
    );
  }

  return (
    <>
      <Head>
        <title>{campaign.name} | Ad Campaign | Avnu Merchant Portal</title>
      </Head>
      <MerchantLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mr-4 text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {campaign.name}
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                {campaign.status === CampaignStatus.ACTIVE ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("pause")}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200"
                  >
                    <PauseIcon className="h-4 w-4 mr-1" />
                    Pause Campaign
                  </button>
                ) : campaign.status === CampaignStatus.PAUSED ? (
                  <button
                    type="button"
                    onClick={() => handleStatusChange("resume")}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                  >
                    <PlayIcon className="h-4 w-4 mr-1" />
                    Resume Campaign
                  </button>
                ) : null}

                <Link
                  href={`/merchant/advertising/${id}/edit`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit Campaign
                </Link>

                <button
                  type="button"
                  onClick={handleDeleteCampaign}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                    confirmDelete
                      ? "text-white bg-red-600 hover:bg-red-700"
                      : "text-red-700 bg-red-100 hover:bg-red-200"
                  }`}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  {confirmDelete ? "Confirm Delete" : "Delete Campaign"}
                </button>
              </div>
            </div>

            {/* Campaign overview */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Campaign Overview
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Created on {formatDate(campaign.createdAt)}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(campaign.status)}`}
                >
                  {campaign.status}
                </span>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Description
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {campaign.description || "No description provided."}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Campaign Type
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {campaign.type === CampaignType.PRODUCT_PROMOTION
                        ? "Product Promotion"
                        : campaign.type === CampaignType.RETARGETING
                          ? "Retargeting"
                          : "Brand Awareness"}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Duration
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {formatDate(campaign.startDate)} to{" "}
                      {formatDate(campaign.endDate)}
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Budget
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      ${campaign.budget.toFixed(2)} total
                      <span className="ml-2 text-gray-500">
                        (${campaign.spent.toFixed(2)} spent, $
                        {(campaign.budget - campaign.spent).toFixed(2)}{" "}
                        remaining)
                      </span>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Target Audience
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {campaign.targetAudience === TargetAudience.ALL
                        ? "All Visitors"
                        : campaign.targetAudience ===
                            TargetAudience.PREVIOUS_VISITORS
                          ? "Previous Visitors"
                          : campaign.targetAudience ===
                              TargetAudience.CART_ABANDONERS
                            ? "Cart Abandoners"
                            : "Previous Customers"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Performance metrics */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Performance Metrics
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Campaign performance statistics
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Impressions
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {campaign.impressions.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Clicks</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {campaign.clicks.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">CTR</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {campaign.ctr.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Conversions
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {campaign.conversions.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Conversion Rate
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {campaign.conversionRate.toFixed(2)}%
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Spent</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      ${campaign.spent.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">ROI</p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      {campaign.roi.toFixed(1)}x
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">
                      Cost per Click
                    </p>
                    <p className="mt-1 text-3xl font-semibold text-gray-900">
                      $
                      {campaign.clicks > 0
                        ? (campaign.spent / campaign.clicks).toFixed(2)
                        : "0.00"}
                    </p>
                  </div>
                </div>

                {/* Performance chart placeholder */}
                <div className="px-6 pb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">
                      Performance Over Time
                    </h4>
                    <div className="flex space-x-2">
                      <button
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          performanceTimeframe === "daily"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => setPerformanceTimeframe("daily")}
                      >
                        Daily
                      </button>
                      <button
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          performanceTimeframe === "weekly"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => setPerformanceTimeframe("weekly")}
                      >
                        Weekly
                      </button>
                      <button
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          performanceTimeframe === "monthly"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                        onClick={() => setPerformanceTimeframe("monthly")}
                      >
                        Monthly
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center">
                    <div className="text-center">
                      <ChartBarIcon className="h-10 w-10 text-gray-400 mx-auto" />
                      <p className="mt-2 text-sm text-gray-500">
                        Performance chart would be rendered here with actual
                        data.
                      </p>
                      <p className="text-xs text-gray-400">
                        Using {performanceTimeframe} data from{" "}
                        {formatDate(campaign.startDate)} to{" "}
                        {formatDate(campaign.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Promoted Products
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Products included in this campaign
                </p>
              </div>
              <div className="border-t border-gray-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border rounded-lg p-4 flex items-start space-x-4"
                    >
                      <div className="h-16 w-16 bg-gray-200 rounded-md flex-shrink-0">
                        {/* Product image placeholder */}
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <TagIcon className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${product.price.toFixed(2)}
                        </p>
                        <Link
                          href={`/merchant/products/${product.id}`}
                          className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Targeting */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Targeting Settings
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Audience targeting configuration
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Demographics */}
                  <div>
                    <div className="flex items-center mb-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Demographics
                      </h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-2">Age Ranges:</p>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {campaign.targetDemographics &&
                        campaign.targetDemographics.length > 0 ? (
                          campaign.targetDemographics.map((age) => (
                            <span
                              key={age}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {age}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            All age ranges
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Locations */}
                  <div>
                    <div className="flex items-center mb-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Locations
                      </h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {campaign.targetLocations &&
                        campaign.targetLocations.length > 0 ? (
                          campaign.targetLocations.map((location) => (
                            <span
                              key={location}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {location}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            Global targeting
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interests */}
                  <div>
                    <div className="flex items-center mb-3">
                      <HeartIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Interests
                      </h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex flex-wrap gap-2">
                        {campaign.targetInterests &&
                        campaign.targetInterests.length > 0 ? (
                          campaign.targetInterests.map((interest) => (
                            <span
                              key={interest}
                              className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                            >
                              {interest}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No specific interests targeted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <div className="flex items-center mb-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Target Audience
                      </h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                        {campaign.targetAudience === "all"
                          ? "All Visitors"
                          : campaign.targetAudience === "previous_visitors"
                            ? "Previous Visitors"
                            : campaign.targetAudience === "cart_abandoners"
                              ? "Cart Abandoners"
                              : "Previous Customers"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MerchantLayout>
    </>
  );
};

export default CampaignDetailPage;
