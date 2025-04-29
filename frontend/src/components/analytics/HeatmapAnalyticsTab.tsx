import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  SelectChangeEvent
} from '@mui/material';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Mock heatmap image URLs for different pages and device types
const MOCK_HEATMAP_IMAGES: Record<string, string> = {
  '/': 'https://via.placeholder.com/800x600/f5f5f5/cccccc?text=Homepage+Heatmap',
  '/shop': 'https://via.placeholder.com/800x600/f5f5f5/cccccc?text=Shop+Page+Heatmap',
  '/product/product-1': 'https://via.placeholder.com/800x600/f5f5f5/cccccc?text=Product+Detail+Heatmap',
  '/checkout': 'https://via.placeholder.com/800x600/f5f5f5/cccccc?text=Checkout+Heatmap',
  '/cart': 'https://via.placeholder.com/800x600/f5f5f5/cccccc?text=Cart+Heatmap',
};

import { HeatmapAnalyticsData } from './types';
import { Grid as GridContainer, Grid as GridItem } from '../ui/MuiGrid';

// Define props interface
interface HeatmapAnalyticsTabProps {
  data: HeatmapAnalyticsData;
  loading?: boolean;
}

// Define heatmap analytics tab component
const HeatmapAnalyticsTab: React.FC<HeatmapAnalyticsTabProps> = ({ data }) => {
  // State for selected page
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [heatmapImage, setHeatmapImage] = useState<string | null>(null);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState<boolean>(false);
  
  // Ref for heatmap container
  const heatmapContainerRef = useRef<HTMLDivElement>(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  // Effect to set initial selected page
  useEffect(() => {
    if (data?.topPages?.length > 0) {
      setSelectedPage(data.topPages[0].pagePath);
    }
  }, [data]);

  // Load mock heatmap image for selected page and device
  const loadHeatmapImage = () => {
    if (!selectedPage) return;
    
    setIsLoadingHeatmap(true);
    
    // Simulate API delay
    setTimeout(() => {
      try {
        // Get mock image URL based on selected page
        const baseImageUrl = MOCK_HEATMAP_IMAGES[selectedPage] || 
          'https://via.placeholder.com/800x600/f5f5f5/cccccc?text=Page+Heatmap';
        
        // Add device type to image URL if specified
        const imageUrl = selectedDevice !== 'all' 
          ? `${baseImageUrl}+(${selectedDevice})` 
          : baseImageUrl;
        
        setHeatmapImage(imageUrl);
      } catch (error) {
        console.error('Failed to load mock heatmap image:', error);
        setHeatmapImage(null);
      } finally {
        setIsLoadingHeatmap(false);
      }
    }, 800); // Simulate network delay
  };

  // Effect to load heatmap image when selected page or device changes
  useEffect(() => {
    if (selectedPage) {
      loadHeatmapImage();
    }
  }, [selectedPage, selectedDevice]);
  
  // This is needed to avoid the dependency warning
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Format percentage
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  const handlePageChange = (e: SelectChangeEvent<string>) => {
    setSelectedPage(e.target.value);
  };

  const handleDeviceChange = (e: SelectChangeEvent<string>) => {
    setSelectedDevice(e.target.value);
  };

  return (
    <GridContainer spacing={3}>
      {/* Heatmap Controls */}
      <GridItem xs={12}>
        <Card>
          <CardHeader title="Interaction Heatmap Visualization" />
          <CardContent>
            <GridContainer spacing={3}>
              <GridItem xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="page-select-label">Select Page</InputLabel>
                  <Select
                    labelId="page-select-label"
                    id="page-select"
                    value={selectedPage}
                    label="Select Page"
                    onChange={handlePageChange}
                  >
                    {data?.topPages?.map((page: any, index: number) => (
                      <MenuItem key={index} value={page.pagePath}>
                        {page.pagePath}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel id="device-select-label">Device Type</InputLabel>
                  <Select
                    labelId="device-select-label"
                    id="device-select"
                    value={selectedDevice}
                    label="Device Type"
                    onChange={handleDeviceChange}
                  >
                    <MenuItem value="all">All Devices</MenuItem>
                    <MenuItem value="desktop">Desktop</MenuItem>
                    <MenuItem value="tablet">Tablet</MenuItem>
                    <MenuItem value="mobile">Mobile</MenuItem>
                  </Select>
                </FormControl>
              </GridItem>
            </GridContainer>
            
            {/* Heatmap Display */}
            <Box 
              ref={heatmapContainerRef}
              sx={{ 
                mt: 4, 
                height: 600, 
                width: '100%', 
                position: 'relative',
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              {isLoadingHeatmap ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    Loading heatmap...
                  </Typography>
                </Box>
              ) : heatmapImage ? (
                <Box 
                  component="img"
                  src={heatmapImage}
                  alt={`Heatmap for ${selectedPage}`}
                  sx={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain'
                  }}
                />
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%'
                  }}
                >
                  <Typography variant="body1" color="textSecondary">
                    No heatmap data available for this page and device combination.
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Interaction Metrics by Page */}
      <GridItem xs={12}>
        <Card>
          <CardHeader title="Interaction Metrics by Page" />
          <CardContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Page Path</TableCell>
                    <TableCell align="right">Click Count</TableCell>
                    <TableCell align="right">Hover Count</TableCell>
                    <TableCell align="right">Scroll Pause Count</TableCell>
                    <TableCell align="right">Avg Interaction Time (s)</TableCell>
                    <TableCell align="right">Interaction Density</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.interactionMetricsByPage?.slice(0, 15).map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {item.pagePath}
                      </TableCell>
                      <TableCell align="right">{item.clickCount}</TableCell>
                      <TableCell align="right">{item.hoverCount}</TableCell>
                      <TableCell align="right">{item.scrollPauseCount}</TableCell>
                      <TableCell align="right">{item.avgInteractionTime.toFixed(1)}</TableCell>
                      <TableCell align="right">{formatPercentage(item.interactionDensity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </GridItem>

      {/* Device Type Distribution */}
      <GridItem xs={12} md={6}>
        <Card>
          <CardHeader title="Interactions by Device Type" />
          <CardContent>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.interactionsByDeviceType}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="deviceType" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Interaction Count']}
                  />
                  <Legend />
                  <Bar dataKey="interactionCount" name="Interaction Count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Interaction Time Distribution */}
      <GridItem xs={12} md={6}>
        <Card>
          <CardHeader title="Interaction Time Distribution" />
          <CardContent>
            <Box height={300}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data?.interactionTimeDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="timeRange" 
                    tickFormatter={(value) => value.replace('seconds', 's')}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Session Count']}
                  />
                  <Legend />
                  <Bar dataKey="sessionCount" name="Session Count" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>
    </GridContainer>
  );
};

export default HeatmapAnalyticsTab;
