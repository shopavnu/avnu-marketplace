import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, gql } from "@apollo/client";
import AdminLayout from "../../../components/admin/AdminLayout";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Define interfaces for data structures
interface InteractionTimeSeriesItem {
  date: string;
  interactionCount: number;
  conversionCount: number;
  bounceCount: number;
  searchCount: number;
  clickCount: number;
  averageDwellTime?: number;
}

interface CategoryItem {
  category: string;
  count: number;
  percentage: number;
  clickThroughRateImprovement: number;
  conversionRateImprovement: number;
  dwellTimeImprovement: number;
}

interface UserPreference {
  id: string;
  name: string;
  value: number;
  category?: string;
  source?: string;
  strength?: number;
  lastUpdated?: string;
}

interface UserSession {
  id: string;
  startTime?: string;
  endTime?: string;
  timestamp?: string;
  duration: number;
  pageViews: number;
  actions?: string[];
  interactionCount?: number;
  searchCount?: number;
  clickCount?: number;
  conversionCount?: number;
  hasPersonalization?: boolean;
  personalizationImpact?: {
    clickThroughRateImprovement?: number;
    conversionRateImprovement?: number;
    dwellTimeImprovement?: number;
  };
}

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

// GraphQL query for user journey data
const USER_JOURNEY = gql`
  query UserJourney($userId: ID!, $period: Int) {
    userJourney(userId: $userId, period: $period) {
      user {
        id
        email
        name
        segment {
          id
          name
        }
        registrationDate
        lastLoginDate
      }
      sessions {
        id
        startTime
        endTime
        duration
        interactionCount
        searchCount
        clickCount
        conversionCount
        hasPersonalization
        personalizationImpact {
          clickThroughRateImprovement
          conversionRateImprovement
          dwellTimeImprovement
        }
      }
      interactions {
        date
        interactionCount
        searchCount
        clickCount
        conversionCount
        averageDwellTime
      }
      preferences {
        category
        value
        source
        strength
        lastUpdated
      }
      personalizationEffectiveness {
        overall {
          clickThroughRateImprovement
          conversionRateImprovement
          dwellTimeImprovement
        }
        byCategory {
          category
          clickThroughRateImprovement
          conversionRateImprovement
          dwellTimeImprovement
        }
      }
    }
  }
`;

// GraphQL query for user search
const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int) {
    searchUsers(query: $query, limit: $limit) {
      id
      email
      name
    }
  }
`;

const UserJourneyDashboard: React.FC = () => {
  const router = useRouter();
  const { userId: userIdFromUrl, segment: segmentId } = router.query;

  const [userId, setUserId] = useState<string | null>(null);
  const [period, setPeriod] = useState<number>(30);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Set userId from URL parameter when available
  useEffect(() => {
    if (userIdFromUrl && typeof userIdFromUrl === "string") {
      setUserId(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  // Fetch user journey data
  const {
    data: journeyData,
    loading: journeyLoading,
    error: journeyError,
    refetch: refetchJourney,
  } = useQuery(USER_JOURNEY, {
    variables: { userId, period },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  // Fetch user search results
  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
    refetch: refetchSearch,
  } = useQuery(SEARCH_USERS, {
    variables: { query: searchQuery, limit: 5 },
    skip: !isSearching || !searchQuery,
    fetchPolicy: "network-only",
  });

  // Handle user search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      refetchSearch({ query: searchQuery, limit: 5 });
    }
  };

  // Select a user from search results
  const selectUser = (selectedUserId: string) => {
    setUserId(selectedUserId);
    setIsSearching(false);
    refetchJourney({ userId: selectedUserId, period });

    // Update URL with selected user ID
    router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, userId: selectedUserId },
      },
      undefined,
      { shallow: true },
    );
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format duration in milliseconds
  const formatDuration = (ms: number) => {
    if (!ms) return "0s";

    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Format percentages for display
  const formatPercentage = (
    value: number | null | undefined,
    decimals = 2,
  ): string => {
    if (value === undefined || value === null) return "0%";
    return typeof value === "number" ? `${value.toFixed(decimals)}%` : "0%";
  };

  // Prepare data for interactions over time chart
  const prepareInteractionsTimeSeriesData = (
    interactions: InteractionTimeSeriesItem[],
  ) => {
    if (!interactions || interactions.length === 0) return null;

    return {
      labels: interactions.map((item: InteractionTimeSeriesItem) => item.date),
      datasets: [
        {
          label: "Interactions",
          data: interactions.map(
            (item: InteractionTimeSeriesItem) => item.interactionCount,
          ),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Searches",
          data: interactions.map(
            (item: InteractionTimeSeriesItem) => item.searchCount,
          ),
          borderColor: "rgba(153, 102, 255, 1)",
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          fill: true,
          tension: 0.4,
        },
        {
          label: "Clicks",
          data: interactions.map(
            (item: InteractionTimeSeriesItem) => item.clickCount,
          ),
          borderColor: "rgba(255, 159, 64, 1)",
          backgroundColor: "rgba(255, 159, 64, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for personalization effectiveness by category chart
  const preparePersonalizationByCategoryData = (byCategory: CategoryItem[]) => {
    if (!byCategory || byCategory.length === 0) return null;

    return {
      labels: byCategory.map((item: CategoryItem) => item.category),
      datasets: [
        {
          label: "CTR Improvement",
          data: byCategory.map(
            (item: CategoryItem) => item.clickThroughRateImprovement * 100,
          ),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Conversion Improvement",
          data: byCategory.map(
            (item: CategoryItem) => item.conversionRateImprovement * 100,
          ),
          backgroundColor: "rgba(153, 102, 255, 0.6)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
        {
          label: "Dwell Time Improvement",
          data: byCategory.map(
            (item: CategoryItem) => item.dwellTimeImprovement * 100,
          ),
          backgroundColor: "rgba(255, 159, 64, 0.6)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Handle loading and error states
  if (journeyLoading && userId) {
    return (
      <AdminLayout title="User Journey Analysis">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (journeyError) {
    return (
      <AdminLayout title="User Journey Analysis">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading user journey data. Please try again later.</p>
          {journeyError && (
            <p className="text-sm mt-2">{journeyError.message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  // Return the main component
  return (
    <AdminLayout title="User Journey Analysis">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">User Journey Analysis</h1>
        <p className="text-gray-500">
          View detailed user journey data and personalization effectiveness
        </p>
      </div>

      {/* Placeholder for the actual implementation */}
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-center text-gray-500">
          This is a placeholder for the User Journey Analysis dashboard.
        </p>
      </div>
    </AdminLayout>
  );
};

export default UserJourneyDashboard;
