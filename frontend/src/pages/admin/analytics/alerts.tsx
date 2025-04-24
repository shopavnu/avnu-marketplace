import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import AdminLayout from '../../../components/admin/AdminLayout';
import { BellIcon, ExclamationCircleIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

// GraphQL query for alerts
const GET_ALERTS = gql`
  query GetAlerts($status: String, $type: String, $period: Int) {
    alerts(status: $status, type: $type, period: $period) {
      id
      title
      description
      type
      severity
      status
      createdAt
      updatedAt
      metrics {
        name
        value
        previousValue
        changePercentage
        threshold
      }
      affectedSegments {
        id
        name
        userCount
      }
    }
  }
`;

// GraphQL mutation for updating alert status
const UPDATE_ALERT_STATUS = gql`
  mutation UpdateAlertStatus($id: ID!, $status: String!) {
    updateAlertStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const AlertsDashboard: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [period, setPeriod] = useState<number>(30);
  
  // Fetch alerts data
  const { 
    data, 
    loading, 
    error,
    refetch
  } = useQuery(GET_ALERTS, {
    variables: { 
      status: statusFilter === 'ALL' ? null : statusFilter,
      type: typeFilter === 'ALL' ? null : typeFilter,
      period 
    },
    fetchPolicy: 'network-only',
  });

  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get severity class for styling
  const getSeverityClass = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'text-red-600 bg-red-100';
      case 'MEDIUM':
        return 'text-amber-600 bg-amber-100';
      case 'LOW':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get icon for alert type
  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'PERSONALIZATION_DROP':
        return <ChartBarIcon className="h-5 w-5" />;
      case 'UNUSUAL_PATTERN':
        return <ExclamationCircleIcon className="h-5 w-5" />;
      case 'AB_TEST_RESULT':
        return <CheckCircleIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  // Handle loading and error states
  if (loading) {
    return (
      <AdminLayout title="Personalization Alerts">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sage"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Personalization Alerts">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p>Error loading alerts. Please try again later.</p>
          {error && (
            <p className="text-sm mt-2">{error.message}</p>
          )}
        </div>
      </AdminLayout>
    );
  }

  const alerts = data?.alerts || [];

  return (
    <AdminLayout title="Personalization Alerts">
      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="RESOLVED">Resolved</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent"
          >
            <option value="ALL">All Types</option>
            <option value="PERSONALIZATION_DROP">Personalization Drop</option>
            <option value="UNUSUAL_PATTERN">Unusual Pattern</option>
            <option value="AB_TEST_RESULT">A/B Test Result</option>
          </select>
        </div>
        
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

      {/* Alerts summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-sage bg-opacity-10 rounded-full p-3">
              <BellIcon className="h-6 w-6 text-sage" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Alerts</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {alerts.length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-red-50 rounded-full p-3">
              <ExclamationCircleIcon className="h-6 w-6 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">High Severity</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {alerts.filter(alert => alert.severity === 'HIGH').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-50 rounded-full p-3">
              <ExclamationCircleIcon className="h-6 w-6 text-amber-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Medium Severity</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {alerts.filter(alert => alert.severity === 'MEDIUM').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
              <ExclamationCircleIcon className="h-6 w-6 text-blue-500" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Low Severity</h3>
              <p className="text-2xl font-semibold text-charcoal">
                {alerts.filter(alert => alert.severity === 'LOW').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {alerts.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {alerts.map(alert => (
              <div key={alert.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-full ${getSeverityClass(alert.severity)}`}>
                      {getAlertTypeIcon(alert.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{alert.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">{alert.description}</p>
                      <div className="mt-2 flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {alert.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          Created: {formatDate(alert.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {alert.status === 'ACTIVE' && (
                      <button
                        className="bg-sage text-white px-3 py-1 rounded-md text-sm hover:bg-sage-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
                        onClick={() => {
                          // In a real implementation, this would call the updateAlertStatus mutation
                          alert('Acknowledging alert: ' + alert.id);
                        }}
                      >
                        Acknowledge
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={() => {
                          // In a real implementation, this would call the updateAlertStatus mutation
                          alert('Resolving alert: ' + alert.id);
                        }}
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Metrics */}
                {alert.metrics && alert.metrics.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Affected Metrics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {alert.metrics.map((metric, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                            <span className={`text-sm font-medium ${metric.changePercentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {metric.changePercentage > 0 ? '+' : ''}{metric.changePercentage.toFixed(2)}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Current: {metric.value}</span>
                            <span>Previous: {metric.previousValue}</span>
                          </div>
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Threshold: {metric.threshold}</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`rounded-full h-1.5 ${metric.changePercentage < 0 ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${Math.min(100, Math.abs(metric.changePercentage))}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Affected segments */}
                {alert.affectedSegments && alert.affectedSegments.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Affected User Segments</h4>
                    <div className="flex flex-wrap gap-2">
                      {alert.affectedSegments.map(segment => (
                        <span key={segment.id} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {segment.name} ({segment.userCount.toLocaleString()} users)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">
              No alerts found for the selected filters.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AlertsDashboard;
