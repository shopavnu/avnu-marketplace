import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader, 
  Tabs, 
  Tab, 
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent
} from '@mui/material';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNavigation from '../../../components/admin/AnalyticsNavigation';
// Using mock data instead of axios
import { GridContainer, GridItem } from '../../../components/ui/MuiGrid';

// Import analytics components with type declarations
interface ScrollAnalyticsProps {
  data: any;
  loading: boolean;
}

interface HeatmapAnalyticsProps {
  data: any;
  loading: boolean;
}

interface ConversionFunnelProps {
  data: any;
  loading: boolean;
}

// Use dynamic imports to avoid TypeScript errors
const ScrollAnalyticsTab = (props: ScrollAnalyticsProps) => {
  // Placeholder implementation until the actual component is fixed
  const { loading } = props;
  return loading ? <div>Loading...</div> : <div>Scroll Analytics Content</div>;
};

const HeatmapAnalyticsTab = (props: HeatmapAnalyticsProps) => {
  // Placeholder implementation until the actual component is fixed
  const { loading } = props;
  return loading ? <div>Loading...</div> : <div>Heatmap Analytics Content</div>;
};

const ConversionFunnelTab = (props: ConversionFunnelProps) => {
  // Placeholder implementation until the actual component is fixed
  const { loading } = props;
  return loading ? <div>Loading...</div> : <div>Conversion Funnel Content</div>;
};

// Define tab panel component
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`behavior-tabpanel-${index}`}
      aria-labelledby={`behavior-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Define user behavior analytics dashboard
export default function UserBehaviorDashboard() {
  // State for tab value
  const [tabValue, setTabValue] = useState(0);
  
  // State for period selection
  const [period, setPeriod] = useState(30);
  
  // State for loading indicators
  const [scrollLoading, setScrollLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);
  const [funnelLoading, setFunnelLoading] = useState(true);
  
  // State for analytics data
  const [scrollData, setScrollData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any>(null);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number): void => {
    setTabValue(newValue);
  };

  // Load scroll analytics data with mock data
  const loadScrollData = () => {
    setScrollLoading(true);
    try {
      // Mock data instead of API call
      setTimeout(() => {
        setScrollData({
          averageScrollDepth: 65,
          scrollHeatmap: [
            { position: 0, density: 100 },
            { position: 25, density: 85 },
            { position: 50, density: 60 },
            { position: 75, density: 40 },
            { position: 100, density: 25 }
          ],
          scrollByPage: [
            { page: '/', averageDepth: 70 },
            { page: '/products', averageDepth: 65 },
            { page: '/product/123', averageDepth: 85 },
            { page: '/cart', averageDepth: 90 },
            { page: '/checkout', averageDepth: 95 }
          ]
        });
        setScrollLoading(false);
      }, 800);
    } catch (error) {
      console.error('Failed to load scroll analytics data:', error);
      setScrollLoading(false);
    }
  };

  // Load heatmap data with mock data
  const loadHeatmapData = () => {
    setHeatmapLoading(true);
    try {
      // Mock data instead of API call
      setTimeout(() => {
        setHeatmapData({
          clickHeatmap: [
            { x: 100, y: 150, value: 25 },
            { x: 300, y: 200, value: 40 },
            { x: 500, y: 250, value: 15 },
            { x: 700, y: 300, value: 30 }
          ],
          topClickedElements: [
            { selector: '#product-card-1', clicks: 450 },
            { selector: '#add-to-cart-btn', clicks: 320 },
            { selector: '#nav-menu', clicks: 280 },
            { selector: '#search-bar', clicks: 210 }
          ],
          pageViews: [
            { page: '/', views: 5000 },
            { page: '/products', views: 3500 },
            { page: '/product/123', views: 2000 },
            { page: '/cart', views: 1200 }
          ]
        });
        setHeatmapLoading(false);
      }, 800);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
      setHeatmapLoading(false);
    }
  };

  // Load funnel data with mock data
  const loadFunnelData = () => {
    setFunnelLoading(true);
    try {
      // Mock data instead of API call
      setTimeout(() => {
        setFunnelData({
          conversionSteps: [
            { step: 'Homepage Visit', count: 10000, rate: 100 },
            { step: 'Product View', count: 7500, rate: 75 },
            { step: 'Add to Cart', count: 3000, rate: 40 },
            { step: 'Checkout', count: 1800, rate: 60 },
            { step: 'Purchase', count: 1200, rate: 67 }
          ],
          dropOffPoints: [
            { from: 'Homepage', to: 'Product', count: 2500 },
            { from: 'Product', to: 'Cart', count: 4500 },
            { from: 'Cart', to: 'Checkout', count: 1200 },
            { from: 'Checkout', to: 'Purchase', count: 600 }
          ],
          conversionBySource: [
            { source: 'Direct', rate: 8.5 },
            { source: 'Organic Search', rate: 6.2 },
            { source: 'Social Media', rate: 4.8 },
            { source: 'Email', rate: 12.3 },
            { source: 'Referral', rate: 9.1 }
          ]
        });
        setFunnelLoading(false);
      }, 800);
    } catch (error) {
      console.error('Failed to load funnel data:', error);
      setFunnelLoading(false);
    }
  };

  // Load all data when component mounts or filters change
  useEffect(() => {
    loadScrollData();
    loadHeatmapData();
    loadFunnelData();
  }, [period]);

  // Render loading state
  const renderLoading = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <CircularProgress />
    </Box>
  );

  // Render no data state
  const renderNoData = () => (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
      <Typography variant="h6" color="text.secondary">No data available</Typography>
    </Box>
  );

  return (
    <AdminLayout title="User Behavior Analytics Dashboard">
      <AnalyticsNavigation />
      <Box sx={{ width: '100%', p: 3 }}>
        <Typography variant="h4" gutterBottom>
          User Behavior Analytics Dashboard
        </Typography>

        {/* Filters */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <GridContainer spacing={3}>
            <GridItem xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="period-select-label">Time Period</InputLabel>
                <Select
                  labelId="period-select-label"
                  id="period-select"
                  value={period.toString()}
                  label="Time Period"
                  onChange={(e: SelectChangeEvent) => setPeriod(Number(e.target.value))}
                >
                  <MenuItem value={1}>Last 24 Hours</MenuItem>
                  <MenuItem value={7}>Last 7 Days</MenuItem>
                  <MenuItem value={30}>Last 30 Days</MenuItem>
                  <MenuItem value={90}>Last 90 Days</MenuItem>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem xs={12} md={1}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  loadScrollData();
                  loadHeatmapData();
                  loadFunnelData();
                }}
              >
                Refresh
              </Button>
            </GridItem>
          </GridContainer>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="user behavior analytics tabs">
            <Tab label="Vertical Scroll Analytics" id="behavior-tab-0" aria-controls="behavior-tabpanel-0" />
            <Tab label="Interaction Heatmaps" id="behavior-tab-1" aria-controls="behavior-tabpanel-1" />
            <Tab label="Vertical Conversion Funnels" id="behavior-tab-2" aria-controls="behavior-tabpanel-2" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={tabValue} index={0}>
          <ScrollAnalyticsTab data={scrollData} loading={scrollLoading} />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <HeatmapAnalyticsTab data={heatmapData} loading={heatmapLoading} />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <ConversionFunnelTab data={funnelData} loading={funnelLoading} />
        </TabPanel>
      </Box>
    </AdminLayout>
  );
}
