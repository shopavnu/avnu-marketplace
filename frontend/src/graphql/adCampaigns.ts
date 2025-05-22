import { gql } from "@apollo/client";

// Fragment for ad campaign fields
export const AD_CAMPAIGN_FIELDS = gql`
  fragment AdCampaignFields on MerchantAdCampaign {
    id
    name
    description
    type
    status
    budget
    spent
    productIds
    targetAudience
    targetDemographics
    targetLocations
    targetInterests
    startDate
    endDate
    impressions
    clicks
    clickThroughRate
    conversions
    conversionRate
    createdAt
    updatedAt
    lastUpdatedByMerchantAt
  }
`;

// Query to get all campaigns for a merchant
export const GET_MERCHANT_CAMPAIGNS = gql`
  query GetMerchantCampaigns($merchantId: ID!) {
    merchantAdCampaigns(merchantId: $merchantId) {
      ...AdCampaignFields
    }
  }
  ${AD_CAMPAIGN_FIELDS}
`;

// Query to get a single campaign by ID
export const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!, $merchantId: ID!) {
    merchantAdCampaign(id: $id, merchantId: $merchantId) {
      ...AdCampaignFields
    }
  }
  ${AD_CAMPAIGN_FIELDS}
`;

// Query to get merchant products for campaign selection
export const GET_MERCHANT_PRODUCTS = gql`
  query GetMerchantProducts($merchantId: ID!) {
    merchantProducts(merchantId: $merchantId) {
      id
      name
      description
      price
      imageUrl
      isActive
      createdAt
      updatedAt
    }
  }
`;

// Mutation to create a new ad campaign
export const CREATE_AD_CAMPAIGN = gql`
  mutation CreateAdCampaign($merchantId: ID!, $input: CreateAdCampaignInput!) {
    createAdCampaign(merchantId: $merchantId, input: $input) {
      ...AdCampaignFields
    }
  }
  ${AD_CAMPAIGN_FIELDS}
`;

// Mutation to update an existing ad campaign
export const UPDATE_AD_CAMPAIGN = gql`
  mutation UpdateAdCampaign(
    $id: ID!
    $merchantId: ID!
    $input: UpdateAdCampaignInput!
  ) {
    updateAdCampaign(id: $id, merchantId: $merchantId, input: $input) {
      ...AdCampaignFields
    }
  }
  ${AD_CAMPAIGN_FIELDS}
`;

// Mutation to delete an ad campaign
export const DELETE_AD_CAMPAIGN = gql`
  mutation DeleteAdCampaign($id: ID!, $merchantId: ID!) {
    deleteAdCampaign(id: $id, merchantId: $merchantId)
  }
`;

// Mutation to change campaign status (activate, pause, etc.)
export const UPDATE_CAMPAIGN_STATUS = gql`
  mutation UpdateCampaignStatus(
    $id: ID!
    $merchantId: ID!
    $status: CampaignStatus!
  ) {
    updateCampaignStatus(id: $id, merchantId: $merchantId, status: $status) {
      id
      status
      updatedAt
    }
  }
`;

// Query to get budget forecast for planning
export const GET_BUDGET_FORECAST = gql`
  query GetBudgetForecast(
    $budget: Float!
    $campaignType: String!
    $targetAudience: String!
  ) {
    budgetForecast(
      budget: $budget
      campaignType: $campaignType
      targetAudience: $targetAudience
    ) {
      recommendedBudget
      estimatedImpressions
      estimatedClicks
      estimatedConversions
      estimatedCostPerClick
      estimatedCostPerMille
      estimatedCostPerAcquisition
    }
  }
`;

// Get campaign analytics data
export const GET_CAMPAIGN_ANALYTICS = gql`
  query GetCampaignAnalytics(
    $merchantId: ID!
    $startDate: String!
    $endDate: String!
  ) {
    campaignAnalytics(
      merchantId: $merchantId
      startDate: $startDate
      endDate: $endDate
    ) {
      totalSpent
      totalImpressions
      totalClicks
      totalConversions
      ctr
      conversionRate
      roi
      previousPeriod {
        totalSpent
        totalImpressions
        totalClicks
        totalConversions
        ctr
        conversionRate
        roi
      }
      dailyData {
        date
        impressions
        clicks
        conversions
        spent
      }
      topCampaigns {
        id
        name
        impressions
        clicks
        ctr
        conversions
        spent
        roi
      }
    }
  }
`;

// Query to get ad placement recommendations
export const GET_AD_PLACEMENT_RECOMMENDATIONS = gql`
  query GetAdPlacementRecommendations($merchantId: ID!, $productIds: [ID!]!) {
    adPlacementRecommendations(
      merchantId: $merchantId
      productIds: $productIds
    ) {
      placementType
      recommendedBid
      estimatedImpressions
      estimatedClicks
      estimatedConversions
      relevanceScore
    }
  }
`;
