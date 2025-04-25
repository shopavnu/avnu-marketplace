import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import AdminLayout from '../../../components/admin/AdminLayout';

// Define interfaces for data structures
interface Segment {
  id: string;
  name: string;
  userCount: number;
  conversionRate?: number;
  averageOrderValue?: number;
  engagementScore?: number;
  description?: string;
  averagePersonalizationImpact?: {
    clickThroughRateImprovement?: number;
    conversionRateImprovement?: number;
    dwellTimeImprovement?: number;
  };
  topPreferences?: Array<{
    id: string;
    name: string;
    value: string | number;
    category?: string;
    count?: number;
  }>;
  preferences?: Array<{
    id: string;
    name: string;
    value: string | number;
  }>;
}
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// GraphQL query for user segments
const USER_SEGMENTS = gql`
  query UserSegments($period: Int) {
    userSegments(period: $period) {
      segments {
        id
        name
        description
        userCount
        averagePersonalizationImpact {
          clickThroughRateImprovement
          conversionRateImprovement
          dwellTimeImprovement
        }
        topPreferences {
          category
          count
          percentage
        }
      }
      totalUsers
    }
  }
`;

const UserSegmentsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<number>(30);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  
  // Fetch user segments data
  const { 
    data, 
    loading, 
    error 
  } = useQuery(USER_SEGMENTS, {
    variables: { period },
    fetchPolicy: 'network-only',
  });

  // Format percentages for display
  const formatPercentage = (value: number | undefined | null, decimals = 2) => {
    if (value === undefined || value === null) return '0%';
    return `${(value * 100).toFixed(decimals)}%`;
  };

  // Prepare data for segment distribution chart
  const prepareSegmentDistributionData = (segments: Segment[]) => {
    if (!segments || segments.length === 0) return {
      labels: [],
      datasets: [{ label: 'User Count', data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
    };

    return {
      labels: segments.map((segment: Segment) => segment.name),
      datasets: [
        {
          label: 'User Count',
          data: segments.map((segment: Segment) => segment.userCount),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for personalization impact chart
  const preparePersonalizationImpactData = (segments: Segment[]) => {
    if (!segments || segments.length === 0) return {
      labels: [],
      datasets: [{ label: 'CTR Improvement', data: [], backgroundColor: '', borderColor: '', borderWidth: 1 }]
    };

    return {
      labels: segments.map(segment => segment.name),
      datasets: [
        {
          label: 'CTR Improvement',
          data: segments.map((segment: Segment) => segment.averagePersonalizationImpact?.clickThroughRateImprovement ? segment.averagePersonalizationImpact.clickThroughRateImprovement * 100 : 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
        {
          label: 'Conversion Improvement',
          data: segments.map((segment: Segment) => segment.averagePersonalizationImpact?.conversionRateImprovement ? segment.averagePersonalizationImpact.conversionRateImprovement * 100 : 0),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
        {
          label: 'Dwell Time Improvement',
          data: segments.map((segment: Segment) => segment.averagePersonalizationImpact?.dwellTimeImprovement ? segment.averagePersonalizationImpact.dwellTimeImprovement * 100 : 0),
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for segment performance chart
  const prepareSegmentPerformanceData = (segments: Segment[]) => {
    if (!segments || segments.length === 0) return {
      labels: [],
      datasets: [{ label: 'Conversion Rate', data: [], backgroundColor: '', borderColor: '', borderWidth: 1 }]
    };

    return {
      labels: segments.map((segment: Segment) => segment.name),
      datasets: [
        {
          label: 'Conversion Rate',
          data: segments.map((segment: Segment) => segment.conversionRate ? segment.conversionRate * 100 : 0),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Get the selected segment
  const selectedSegment = data?.userSegments?.segments?.find(
    (segment: Segment) => segment.id === selectedSegmentId
  );

  // Prepare data for top preferences chart
  const prepareTopPreferencesData = (segment: Segment) => {
    if (!segment || !segment.topPreferences || segment.topPreferences.length === 0) return {
      labels: [],
      datasets: [{ label: 'Preference Count', data: [], backgroundColor: [], borderColor: [], borderWidth: 1 }]
    };

    return {
      labels: segment.topPreferences.map(pref => pref.category),
      datasets: [
        {
          label: 'Preference Count',
          data: segment.topPreferences.map(pref => pref.count),
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Render segment details
  const renderSegmentDetails = (segment: Segment) => {
    if (!segment) return null;

    return (
      <div key={segment.id} className="mb-4 last:mb-0">
        <h3 className="font-medium text-gray-900">{segment.name}</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Users:</span>
            <span className="font-medium">{segment.userCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">% of Total:</span>
            <span className="font-medium">{formatPercentage(segment.userCount / (data?.userSegments?.totalUsers || 0))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">CTR Improvement:</span>
            <span className="font-medium text-green-600">
              {formatPercentage(segment.averagePersonalizationImpact?.clickThroughRateImprovement)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Handle loading and error states
  if (loading) {
    return (
      <AdminLayout title="User Segments">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="User Segments">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading user segment data. Please try again later.</p>
          {error && (
            <p className="text-sm mt-2">{error.message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  const segments = data?.userSegments?.segments || [];
  const totalUsers = data?.userSegments?.totalUsers || 0;

  return (
    <AdminLayout title="User Segments">
      {/* Period selector */}
      <div className="mb-6 flex justify-end">
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">User Segmentation Overview</h2>
        <p className="text-gray-600 mb-4">
          Users are segmented based on their interaction patterns and response to personalization.
          Total users in the selected period: <span className="font-semibold">{totalUsers.toLocaleString()}</span>
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Segment distribution chart */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">User Distribution by Segment</h3>
            <div className="h-64">
              <Pie 
                data={prepareSegmentDistributionData(segments)}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </div>
          
          {/* Personalization impact chart */}
          <div>
            <h3 className="text-md font-medium text-gray-800 mb-2">Personalization Impact by Segment</h3>
            <div className="h-64">
              <Bar 
                data={preparePersonalizationImpactData(segments)}
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

      {/* Segment details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {segments.map((segment: Segment) => (
          <div 
            key={segment.id}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all duration-200 ${
              selectedSegmentId === segment.id ? 'ring-2 ring-sage' : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedSegmentId(segment.id)}
          >
            {renderSegmentDetails(segment)}
          </div>
        ))}
      </div>

      {/* Selected segment details */}
      {selectedSegment && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {selectedSegment.name} Segment Details
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-medium text-gray-800 mb-2">Personalization Impact</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Click-Through Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      +{formatPercentage(selectedSegment.averagePersonalizationImpact.clickThroughRateImprovement)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2" 
                      style={{ width: `${Math.min(100, selectedSegment.averagePersonalizationImpact.clickThroughRateImprovement * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium text-green-600">
                      +{formatPercentage(selectedSegment.averagePersonalizationImpact.conversionRateImprovement)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2" 
                      style={{ width: `${Math.min(100, selectedSegment.averagePersonalizationImpact.conversionRateImprovement * 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600">Dwell Time</span>
                    <span className="text-sm font-medium text-green-600">
                      +{formatPercentage(selectedSegment.averagePersonalizationImpact.dwellTimeImprovement)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 rounded-full h-2" 
                      style={{ width: `${Math.min(100, selectedSegment.averagePersonalizationImpact.dwellTimeImprovement * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-md font-medium text-gray-800 mb-2">Top User Preferences</h3>
              <div className="h-64">
                <Bar 
                  data={prepareTopPreferencesData(selectedSegment)}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    scales: {
                      x: {
                        beginAtZero: true,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              className="bg-sage text-white px-4 py-2 rounded-md hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              onClick={() => window.location.href = `/admin/analytics/user-journey?segment=${selectedSegment.id}`}
            >
              View User Journeys
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UserSegmentsDashboard;
