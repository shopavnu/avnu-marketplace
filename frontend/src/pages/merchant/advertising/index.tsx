import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from '@apollo/client';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  EyeIcon,
  ArrowsUpDownIcon,
  ChartBarIcon,
  PauseIcon,
  PlayIcon,
  FunnelIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import MerchantLayout from '@/components/merchant/MerchantLayout';
import { 
  AdCampaign, 
  CampaignStatus, 
  CampaignType,
  TargetAudience 
} from '@/types/adCampaigns';
import { 
  GET_MERCHANT_CAMPAIGNS, 
  UPDATE_CAMPAIGN_STATUS, 
  DELETE_AD_CAMPAIGN 
} from '@/graphql/adCampaigns';

// Campaign type options
const campaignTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: CampaignType.PRODUCT_PROMOTION, label: 'Product Promotion' },
  { value: CampaignType.RETARGETING, label: 'Retargeting' },
  { value: CampaignType.BRAND_AWARENESS, label: 'Brand Awareness' }
];

// Date range options for filtering
const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' }
];

const statuses = [
  { value: 'All', label: 'All' },
  { value: CampaignStatus.ACTIVE, label: 'Active' },
  { value: CampaignStatus.PAUSED, label: 'Paused' },
  { value: CampaignStatus.DRAFT, label: 'Draft' },
  { value: CampaignStatus.COMPLETED, label: 'Completed' }
];

const types = [
  { value: 'All', label: 'All' },
  { value: CampaignType.PRODUCT_PROMOTION, label: 'Product Promotion' },
  { value: CampaignType.BRAND_AWARENESS, label: 'Brand Awareness' },
  { value: CampaignType.RETARGETING, label: 'Retargeting' }
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'status', label: 'Status' },
  { value: 'budget', label: 'Budget' },
  { value: 'spent', label: 'Spent' },
  { value: 'impressions', label: 'Impressions' },
  { value: 'clicks', label: 'Clicks' },
  { value: 'ctr', label: 'CTR' },
  { value: 'conversions', label: 'Conversions' },
  { value: 'roi', label: 'ROI' },
  { value: 'startDate', label: 'Start Date' },
];

const AdvertisingPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<AdCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [showBatchConfirmation, setShowBatchConfirmation] = useState<boolean>(false);
  const [batchAction, setBatchAction] = useState<string>('');

  // GraphQL query for fetching campaigns
  const { data, error, refetch } = useQuery(GET_MERCHANT_CAMPAIGNS, {
    variables: { merchantId: 'current-merchant-id' }, // Replace with actual merchant ID from context
    onCompleted: (data) => {
      if (data?.merchantAdCampaigns) {
        setCampaigns(data.merchantAdCampaigns);
        setLoading(false);
      }
    }
  });

  // Mutation for updating campaign status
  const [updateCampaignStatus] = useMutation(UPDATE_CAMPAIGN_STATUS, {
    onCompleted: () => {
      refetch(); // Refresh the campaign list after status update
    },
    onError: (error) => {
      console.error('Error updating campaign status:', error);
    }
  });

  // Mutation for deleting a campaign
  const [deleteCampaign] = useMutation(DELETE_AD_CAMPAIGN, {
    onCompleted: () => {
      refetch(); // Refresh the campaign list after deletion
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
    }
  });

  // Filter and sort campaigns based on selected criteria
  const filterCampaigns = useCallback(() => {
    if (!campaigns.length) return [];
    
    let filtered = [...campaigns];

    // Apply status filter
    if (selectedStatus !== 'All') {
      filtered = filtered.filter(campaign => campaign.status === selectedStatus);
    }

    // Apply type filter
    if (selectedType !== 'All') {
      filtered = filtered.filter(campaign => campaign.type === selectedType);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(campaign => 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply date range filter
    if (selectedDateRange !== 'all') {
      const now = new Date();
      let startDate: Date;

      switch (selectedDateRange) {
        case 'last7days':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'last30days':
          startDate = new Date(now.setDate(now.getDate() - 30));
          break;
        case 'last90days':
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        default:
          startDate = new Date(0); // Beginning of time
      }

      filtered = filtered.filter(campaign => {
        const campaignStartDate = new Date(campaign.startDate);
        return campaignStartDate >= startDate;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        
        case 'status':
          aValue = a.status;
          bValue = b.status;
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        
        case 'budget':
          aValue = a.budget;
          bValue = b.budget;
          break;
        
        case 'spent':
          aValue = a.spent;
          bValue = b.spent;
          break;
        
        case 'impressions':
          aValue = a.impressions;
          bValue = b.impressions;
          break;
        
        case 'clicks':
          aValue = a.clicks;
          bValue = b.clicks;
          break;
        
        case 'ctr':
          aValue = a.ctr;
          bValue = b.ctr;
          break;
        
        case 'conversions':
          aValue = a.conversions;
          bValue = b.conversions;
          break;
        
        case 'roi':
          aValue = a.roi;
          bValue = b.roi;
          break;
        
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        
        default:
          return 0;
      }

      // For numeric values
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [campaigns, searchTerm, selectedStatus, selectedType, selectedDateRange, sortBy, sortDirection]);

  // Apply filters and update filtered campaigns whenever dependencies change
  useEffect(() => {
    setFilteredCampaigns(filterCampaigns());
  }, [campaigns, searchTerm, selectedStatus, selectedType, selectedDateRange, sortBy, sortDirection]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedType('All');
    setSelectedDateRange('all');
    setSortBy('startDate');
    setSortDirection('desc');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case CampaignStatus.ACTIVE:
        return 'bg-green-100 text-green-800';
      case CampaignStatus.PAUSED:
        return 'bg-yellow-100 text-yellow-800';
      case CampaignStatus.SCHEDULED:
        return 'bg-blue-100 text-blue-800';
      case CampaignStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case CampaignStatus.COMPLETED:
      case CampaignStatus.ENDED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCampaignAction = (campaignId: string, action: string) => {
    if (action === 'pause') {
      updateCampaignStatus({
        variables: {
          id: campaignId,
          merchantId: 'current-merchant-id', // Replace with actual merchant ID from context
          status: CampaignStatus.PAUSED
        }
      });
    } else if (action === 'resume') {
      updateCampaignStatus({
        variables: {
          id: campaignId,
          merchantId: 'current-merchant-id', // Replace with actual merchant ID from context
          status: CampaignStatus.ACTIVE
        }
      });
    } else if (action === 'delete') {
      if (window.confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
        deleteCampaign({
          variables: {
            id: campaignId,
            merchantId: 'current-merchant-id' // Replace with actual merchant ID from context
          }
        });
      }
    }
  };

  const toggleBatchMode = () => {
    setIsBatchMode(!isBatchMode);
    setSelectedCampaigns([]);
  };

  const toggleCampaignSelection = (campaignId: string) => {
    setSelectedCampaigns(prev => 
      prev.includes(campaignId) 
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const selectAllCampaigns = () => {
    if (filteredCampaigns.length === selectedCampaigns.length) {
      setSelectedCampaigns([]);
    } else {
      setSelectedCampaigns(filteredCampaigns.map(campaign => campaign.id));
    }
  };

  const prepareBatchAction = (action: string) => {
    if (selectedCampaigns.length === 0) return;
    setBatchAction(action);
    setShowBatchConfirmation(true);
  };

  const executeBatchAction = async () => {
    try {
      switch (batchAction) {
        case 'pause':
          await Promise.all(selectedCampaigns.map(id => 
            updateCampaignStatus({ variables: { id, status: CampaignStatus.PAUSED } })
          ));
          break;
        case 'resume':
          await Promise.all(selectedCampaigns.map(id => 
            updateCampaignStatus({ variables: { id, status: CampaignStatus.ACTIVE } })
          ));
          break;
        case 'delete':
          await Promise.all(selectedCampaigns.map(id => 
            deleteCampaign({ variables: { id } })
          ));
          break;
        default:
          break;
      }
      setShowBatchConfirmation(false);
      setSelectedCampaigns([]);
      refetch();
    } catch (error) {
      console.error('Error executing batch action:', error);
    }
  };

  const cancelBatchAction = () => {
    setShowBatchConfirmation(false);
    setBatchAction('');
  };

  const BatchConfirmationModal = ({ isOpen, action, count, onConfirm, onCancel }: { 
    isOpen: boolean; 
    action: string; 
    count: number; 
    onConfirm: () => void; 
    onCancel: () => void 
  }) => {
    if (!isOpen) return null;

    let actionText = '';
    let actionColor = '';

    switch (action) {
      case 'pause':
        actionText = 'pause';
        actionColor = 'text-yellow-600';
        break;
      case 'resume':
        actionText = 'resume';
        actionColor = 'text-green-600';
        break;
      case 'delete':
        actionText = 'delete';
        actionColor = 'text-red-600';
        break;
      default:
        actionText = 'update';
        actionColor = 'text-blue-600';
    }

    return (
      <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  {action === 'delete' ? (
                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  ) : action === 'pause' ? (
                    <PauseIcon className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                  ) : (
                    <PlayIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  )}
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirm Batch Action
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to <span className={actionColor}>{actionText}</span> {count} selected campaign{count !== 1 ? 's' : ''}? 
                      {action === 'delete' && ' This action cannot be undone.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${action === 'delete' ? 'bg-red-600 hover:bg-red-700' : action === 'pause' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${action === 'delete' ? 'red' : action === 'pause' ? 'yellow' : 'green'}-500`}
                onClick={onConfirm}
              >
                Confirm
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>Advertising | Merchant Portal | av|nu</title>
        <meta name="description" content="Manage your advertising campaigns on av|nu marketplace" />
      </Head>
      
      <MerchantLayout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">Advertising Campaigns</h1>
            <div className="mt-4 sm:mt-0">
              <Link
                href="/merchant/advertising/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sage hover:bg-sage/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sage"
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create Campaign
              </Link>
            </div>
          </div>
          
          {/* Campaign Stats Overview */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Impressions</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0).toLocaleString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Clicks</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0).toLocaleString()}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Average CTR</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {(campaigns.reduce((sum, campaign) => sum + campaign.clicks, 0) / 
                            campaigns.reduce((sum, campaign) => sum + campaign.impressions, 0) * 100).toFixed(2)}%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                    <ChartBarIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Spent</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          ${campaigns.reduce((sum, campaign) => sum + campaign.spent, 0).toFixed(2)}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mt-6 bg-white shadow rounded-lg p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-grow max-w-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-sage focus:border-sage sm:text-sm"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <div>
                  <label htmlFor="status" className="sr-only">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="type" className="sr-only">Type</label>
                  <select
                    id="type"
                    name="type"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="dateRange" className="sr-only">Date Range</label>
                  <select
                    id="dateRange"
                    name="dateRange"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    {dateRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sortBy" className="sr-only">Sort By</label>
                  <select
                    id="sortBy"
                    name="sortBy"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="sortDirection" className="sr-only">Sort Direction</label>
                  <select
                    id="sortDirection"
                    name="sortDirection"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={sortDirection}
                    onChange={(e) => setSortDirection(e.target.value)}
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Batch Actions Bar */}
          {isBatchMode && selectedCampaigns.length > 0 && (
            <div className="bg-gray-50 p-4 mb-4 rounded-md flex items-center justify-between">
              <div>
                <span className="text-gray-700 font-medium">{selectedCampaigns.length} campaigns selected</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => prepareBatchAction('pause')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <PauseIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                  Pause
                </button>
                <button
                  onClick={() => prepareBatchAction('resume')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <PlayIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                  Resume
                </button>
                <button
                  onClick={() => prepareBatchAction('delete')}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <TrashIcon className="-ml-1 mr-1 h-4 w-4" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </div>
          )}

          {/* Campaigns Table */}
          <div className="mt-6 bg-white shadow overflow-hidden rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('name')}
                      >
                        Campaign
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('startDate')}
                      >
                        Dates
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('budget')}
                      >
                        Budget
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        className="group inline-flex items-center"
                        onClick={() => handleSort('spent')}
                      >
                        Spent
                        <ArrowsUpDownIcon className="ml-1 h-4 w-4 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isBatchMode && (
                    <tr>
                      <td colSpan={7} className="bg-gray-50">
                        <div className="px-4 py-3 sm:px-6">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={selectedCampaigns.length === filteredCampaigns.length && filteredCampaigns.length > 0}
                              onChange={selectAllCampaigns}
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Select All ({filteredCampaigns.length})
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          <div className="text-sm text-gray-500">{campaign.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${campaign.budget.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${campaign.spent.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {(campaign.spent / campaign.budget * 100).toFixed(0)}% of budget
                          </div>
                          <div className="mt-1 relative pt-1">
                            <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                              <div 
                                style={{ width: `${(campaign.spent / campaign.budget * 100).toFixed(0)}%` }}
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-sage"
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-500">Impressions:</span>
                              <span className="ml-1 text-gray-900">{campaign.impressions.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500">Clicks:</span>
                              <span className="ml-1 text-gray-900">{campaign.clicks.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500">CTR:</span>
                              <span className="ml-1 text-gray-900">{campaign.ctr.toFixed(2)}%</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500">ROI:</span>
                              <span className="ml-1 text-gray-900">{campaign.roi.toFixed(1)}x</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {isBatchMode ? (
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                checked={selectedCampaigns.includes(campaign.id)}
                                onChange={() => toggleCampaignSelection(campaign.id)}
                              />
                            ) : (
                              <div>
                                {campaign.status === CampaignStatus.ACTIVE ? (
                                  <button
                                    onClick={() => handleCampaignAction(campaign.id, 'pause')}
                                    className="text-yellow-600 hover:text-yellow-900"
                                  >
                                    <PauseIcon className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only">Pause</span>
                                  </button>
                                ) : campaign.status === CampaignStatus.PAUSED ? (
                                  <button
                                    onClick={() => handleCampaignAction(campaign.id, 'resume')}
                                    className="text-green-600 hover:text-green-900"
                                  >
                                    <PlayIcon className="h-5 w-5" aria-hidden="true" />
                                    <span className="sr-only">Resume</span>
                                  </button>
                                ) : null}
                                <Link 
                                  href={`/merchant/advertising/${campaign.id}`}
                                  className="text-gray-400 hover:text-gray-500"
                                >
                                  <EyeIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">View</span>
                                </Link>
                                <Link 
                                  href={`/merchant/advertising/${campaign.id}/edit`}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  <PencilIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Edit</span>
                                </Link>
                                <button
                                  className="text-red-600 hover:text-red-900"
                                  onClick={() => handleCampaignAction(campaign.id, 'delete')}
                                >
                                  <TrashIcon className="h-5 w-5" aria-hidden="true" />
                                  <span className="sr-only">Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                        No campaigns found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-white border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{filteredCampaigns.length}</span> of <span className="font-medium">{campaigns.length}</span> campaigns
                </div>
              </div>
            </div>
          </div>

          {/* Batch Action Confirmation Modal */}
          <BatchConfirmationModal
            isOpen={showBatchConfirmation}
            action={batchAction}
            count={selectedCampaigns.length}
            onConfirm={executeBatchAction}
            onCancel={cancelBatchAction}
          />
        </div>
      </MerchantLayout>
    </>
  );
};

export default AdvertisingPage;
