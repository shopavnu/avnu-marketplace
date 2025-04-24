import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useQuery, gql } from '@apollo/client';
import AdminLayout from '../../../components/admin/AdminLayout';
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
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  
  // Set userId from URL parameter when available
  useEffect(() => {
    if (userIdFromUrl && typeof userIdFromUrl === 'string') {
      setUserId(userIdFromUrl);
    }
  }, [userIdFromUrl]);

  // Fetch user journey data
  const { 
    data: journeyData, 
    loading: journeyLoading, 
    error: journeyError,
    refetch: refetchJourney
  } = useQuery(USER_JOURNEY, {
    variables: { userId, period },
    skip: !userId,
    fetchPolicy: 'network-only',
  });

  // Fetch user search results
  const { 
    data: searchData, 
    loading: searchLoading, 
    error: searchError,
    refetch: refetchSearch
  } = useQuery(SEARCH_USERS, {
    variables: { query: searchQuery, limit: 5 },
    skip: !isSearching || !searchQuery,
    fetchPolicy: 'network-only',
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
    setSearchQuery('');
    router.push({
      pathname: router.pathname,
      query: { userId: selectedUserId }
    }, undefined, { shallow: true });
  };

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format duration in milliseconds
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  // Format percentages for display
  const formatPercentage = (value: number, decimals = 2) => {
    if (value === undefined || value === null) return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
  };

  // Prepare data for interactions over time chart
  const prepareInteractionsTimeSeriesData = (interactions) => {
    if (!interactions || interactions.length === 0) return null;

    return {
      labels: interactions.map(item => item.date),
      datasets: [
        {
          label: 'Interactions',
          data: interactions.map(item => item.interactionCount),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Searches',
          data: interactions.map(item => item.searchCount),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Clicks',
          data: interactions.map(item => item.clickCount),
          borderColor: 'rgba(255, 159, 64, 1)',
          backgroundColor: 'rgba(255, 159, 64, 0.2)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  // Prepare data for personalization effectiveness by category chart
  const preparePersonalizationByCategoryData = (byCategory) => {
    if (!byCategory || byCategory.length === 0) return null;

    return {
      labels: byCategory.map(item => item.category),
      datasets: [
        {
          label: 'CTR Improvement',
          data: byCategory.map(item => item.clickThroughRateImprovement * 100),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Conversion Improvement',
          data: byCategory.map(item => item.conversionRateImprovement * 100),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
        {
          label: 'Dwell Time Improvement',
          data: byCategory.map(item => item.dwellTimeImprovement * 100),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
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

  const userJourney = journeyData?.userJourney;
  const user = userJourney?.user;
  const sessions = userJourney?.sessions || [];
  const interactions = userJourney?.interactions || [];
  const preferences = userJourney?.preferences || [];
  const personalizationEffectiveness = userJourney?.personalizationEffectiveness || {};

  return (
    <AdminLayout title="User Journey Analysis">
      {/* User search and period selector */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="relative">
          <div className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users by email or name"
              className="bg-white border border-gray-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent w-64"
            />
            <button
              onClick={handleSearch}
              className="bg-sage text-white px-3 py-2 rounded-r-md hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
            >
              Search
            </button>
          </div>
          
          {/* Search results dropdown */}
          {isSearching && searchData?.searchUsers && searchData.searchUsers.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1">
              {searchData.searchUsers.map(user => (
                <div
                  key={user.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectUser(user.id)}
                >
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              ))}
            </div>
          )}
          
          {isSearching && searchLoading && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center">
              <div className="animate-spin inline-block h-4 w-4 border-t-2 border-b-2 border-sage"></div>
              <span className="ml-2">Searching...</span>
            </div>
          )}
          
          {isSearching && searchData?.searchUsers && searchData.searchUsers.length === 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 px-4 text-center">
              No users found
            </div>
          )}
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last 365 days</option>
        </select>
      </div>

      {/* User not selected state */}
      {!userId && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            Search for a user above or select a user to view their journey.
          </p>
        </div>
      )}

      {/* User selected but no data */}
      {userId && !userJourney && !journeyLoading && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">
            No journey data found for this user in the selected time period.
          </p>
        </div>
      )}

      {/* User journey data */}
      {userId && userJourney && (
        <>
          {/* User overview */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div>
                <h2 className="text-xl font-semibold text-charcoal">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <div className="mt-2 flex items-center">
                  <span className="text-sm text-gray-600 mr-2">Segment:</span>
                  <span className="px-2 py-1 bg-sage bg-opacity-10 text-sage rounded-full text-xs font-medium">
                    {user.segment?.name || 'Not Assigned'}
                  </span>
                </div>
              </div>
              <div className="mt-4 md:mt-0 space-y-1">
                <div className="text-sm">
                  <span className="text-gray-500">Registered:</span>
                  <span className="ml-2 font-medium">{formatDate(user.registrationDate)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Last Login:</span>
                  <span className="ml-2 font-medium">{formatDate(user.lastLoginDate)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Sessions:</span>
                  <span className="ml-2 font-medium">{sessions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personalization effectiveness */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Personalization Effectiveness</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-800 mb-3">Overall Impact</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Click-Through Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        +{formatPercentage(personalizationEffectiveness.overall?.clickThroughRateImprovement)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2" 
                        style={{ width: `${Math.min(100, (personalizationEffectiveness.overall?.clickThroughRateImprovement || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <span className="text-sm font-medium text-green-600">
                        +{formatPercentage(personalizationEffectiveness.overall?.conversionRateImprovement)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2" 
                        style={{ width: `${Math.min(100, (personalizationEffectiveness.overall?.conversionRateImprovement || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-600">Dwell Time</span>
                      <span className="text-sm font-medium text-green-600">
                        +{formatPercentage(personalizationEffectiveness.overall?.dwellTimeImprovement)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2" 
                        style={{ width: `${Math.min(100, (personalizationEffectiveness.overall?.dwellTimeImprovement || 0) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-800 mb-3">Impact by Category</h3>
                <div className="h-64">
                  <Bar 
                    data={preparePersonalizationByCategoryData(personalizationEffectiveness.byCategory)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Improvement (%)',
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Interaction trends */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Interaction Trends</h2>
            <div className="h-64">
              <Line 
                data={prepareInteractionsTimeSeriesData(interactions)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* User preferences */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">User Preferences</h2>
            
            {preferences.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Strength
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Last Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preferences.map((pref, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {pref.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pref.value}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {pref.source}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-sage rounded-full h-2" 
                              style={{ width: `${pref.strength * 100}%` }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(pref.lastUpdated)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No preference data available for this user.
              </p>
            )}
          </div>

          {/* Recent sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Sessions</h2>
            
            {sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Interactions
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Searches
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Personalized
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CTR Impact
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sessions.map(session => (
                      <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatDate(session.startTime)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDuration(session.duration)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.interactionCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.searchCount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.hasPersonalization ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {session.hasPersonalization ? (
                            <span className="text-green-600">
                              +{formatPercentage(session.personalizationImpact?.clickThroughRateImprovement)}
                            </span>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No session data available for this user in the selected time period.
              </p>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default UserJourneyDashboard;
