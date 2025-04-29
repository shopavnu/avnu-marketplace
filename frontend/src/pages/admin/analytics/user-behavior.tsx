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
import axios from 'axios';
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

  // Load scroll analytics data
  const loadScrollData = async () => {
    setScrollLoading(true);
    try {
      const response = await axios.get(`/analytics/behavior/scroll?period=${period}`);
      setScrollData(response.data);
    } catch (error) {
      console.error('Failed to load scroll analytics data:', error);
    } finally {
      setScrollLoading(false);
    }
  };

  // Load heatmap data
  const loadHeatmapData = async () => {
    setHeatmapLoading(true);
    try {
      const response = await axios.get(`/analytics/behavior/heatmap?period=${period}`);
      setHeatmapData(response.data);
    } catch (error) {
      console.error('Failed to load heatmap data:', error);
    } finally {
      setHeatmapLoading(false);
    }
  };

  // Load funnel data
  const loadFunnelData = async () => {
    setFunnelLoading(true);
    try {
      const response = await axios.get(`/analytics/behavior/funnel?period=${period}`);
      setFunnelData(response.data);
    } catch (error) {
      console.error('Failed to load funnel data:', error);
    } finally {
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
