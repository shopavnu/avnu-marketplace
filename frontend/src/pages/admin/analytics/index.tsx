import React, { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AnalyticsNavigation from '../../../components/admin/AnalyticsNavigation';
import GridContainer from '../../../components/analytics/GridContainer';
import GridItem from '../../../components/analytics/GridItem';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';

const AdminAnalytics: React.FC = () => {
  // State for period selection
  const [period, setPeriod] = useState<number>(30);
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // State for analytics data
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  
  // Load mock data
  useEffect(() => {
    setLoading(true);
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      try {
        // Sample mock data
        const mockData = {
          totalSessions: 45678,
          avgSessionDuration: 342, // in seconds
          avgInteractionsPerSession: 8.3,
          conversionRate: 4.5, // percentage
          clickThroughRate: 32, // percentage
          personalizationImpact: {
            clickThroughImprovement: 31, // percentage
            conversionImprovement: 36.8 // percentage
          },
          interactionTypes: [
            { type: "Product View", count: 25678 },
            { type: "Search", count: 18765 },
            { type: "Filter", count: 12543 },
            { type: "Add to Cart", count: 8765 },
            { type: "Checkout", count: 4321 }
          ],
          topQueries: [
            { query: "sustainable clothing", count: 1245 },
            { query: "organic cotton", count: 987 },
            { query: "eco-friendly", count: 876 },
            { query: "recycled materials", count: 654 },
            { query: "vegan leather", count: 543 }
          ]
        };
        
        setAnalyticsData(mockData);
        setLoading(false);
      } catch (error) {
        setError(error instanceof Error ? error : new Error('Unknown error occurred'));
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [period]);

  // Handle loading state
  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <AnalyticsNavigation />
        <Box display="flex" justifyContent="center" alignItems="center" height="400px">
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <AnalyticsNavigation />
        <Box p={3}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Error loading analytics data. Please try again later.
          </Alert>
          <Typography color="textSecondary">
            {error.message || 'Unknown error'}
          </Typography>
        </Box>
      </AdminLayout>
    );
  }
  
  // Handle no data state
  if (!analyticsData) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <AnalyticsNavigation />
        <Box p={3}>
          <Alert severity="info">
            No analytics data available. Please try again later.
          </Alert>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics Dashboard">
      <AnalyticsNavigation />
      
      {/* Period selector */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="period-select-label">Period</InputLabel>
          <Select
            labelId="period-select-label"
            id="period-select"
            value={period.toString()}
            onChange={(e: SelectChangeEvent) => setPeriod(Number(e.target.value))}
            label="Period"
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Overview metrics */}
      <GridContainer spacing={3} sx={{ mb: 3 }}>
        <GridItem xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Total Sessions
            </Typography>
            <Typography variant="h4" color="primary">
              {analyticsData.totalSessions?.toLocaleString() || 0}
            </Typography>
          </Paper>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Avg. Interactions
            </Typography>
            <Typography variant="h4" color="primary">
              {analyticsData.avgInteractionsPerSession?.toFixed(1) || 0}
            </Typography>
          </Paper>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Avg. Session Duration
            </Typography>
            <Typography variant="h4" color="primary">
              {analyticsData.avgSessionDuration ? `${(analyticsData.avgSessionDuration / 60).toFixed(1)} min` : '0 min'}
            </Typography>
          </Paper>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Conversion Rate
            </Typography>
            <Typography variant="h4" color="primary">
              {analyticsData.conversionRate?.toFixed(1) || 0}%
            </Typography>
          </Paper>
        </GridItem>
      </GridContainer>
      
      {/* Personalization Impact */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Personalization Impact
        </Typography>
        <GridContainer spacing={3}>
          <GridItem xs={12} md={6}>
            <Box sx={{ bgcolor: '#f0f9f0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Click-Through Improvement
              </Typography>
              <Typography variant="h5" color="success.main">
                +{analyticsData.personalizationImpact?.clickThroughImprovement?.toFixed(1) || 0}%
              </Typography>
              <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4, mt: 1 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'success.main', 
                    height: 8, 
                    borderRadius: 4,
                    width: `${Math.min(100, analyticsData.personalizationImpact?.clickThroughImprovement || 0)}%`
                  }}
                />
              </Box>
            </Box>
          </GridItem>
          <GridItem xs={12} md={6}>
            <Box sx={{ bgcolor: '#f0f9f0', p: 2, borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Conversion Improvement
              </Typography>
              <Typography variant="h5" color="success.main">
                +{analyticsData.personalizationImpact?.conversionImprovement?.toFixed(1) || 0}%
              </Typography>
              <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4, mt: 1 }}>
                <Box 
                  sx={{ 
                    bgcolor: 'success.main', 
                    height: 8, 
                    borderRadius: 4,
                    width: `${Math.min(100, analyticsData.personalizationImpact?.conversionImprovement || 0)}%`
                  }}
                />
              </Box>
            </Box>
          </GridItem>
        </GridContainer>
      </Paper>
      
      {/* Interaction Types and Top Queries */}
      <GridContainer spacing={3} sx={{ mb: 3 }}>
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Interaction Types
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analyticsData.interactionTypes?.map((item: any, index: number) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.type}</Typography>
                    <Typography variant="body2">
                      {item.count.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        height: 8, 
                        borderRadius: 4,
                        width: `${Math.min(100, (item.count / analyticsData.totalSessions) * 100)}%`
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </GridItem>
        
        <GridItem xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Top Search Queries
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analyticsData.topQueries?.map((item: any, index: number) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.query}</Typography>
                    <Typography variant="body2">
                      {item.count.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', bgcolor: '#e0e0e0', height: 8, borderRadius: 4 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'secondary.main', 
                        height: 8, 
                        borderRadius: 4,
                        width: `${Math.min(100, (item.count / (analyticsData.topQueries[0]?.count || 1)) * 100)}%`
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </GridItem>
      </GridContainer>
      
      {/* Call to Action */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { md: 'center' } }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Need More Detailed Analytics?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Check out our performance metrics and user behavior sections for in-depth analysis.
            </Typography>
          </Box>
          <Box sx={{ mt: { xs: 2, md: 0 }, display: 'flex', gap: 2 }}>
            <Box 
              component="a" 
              href="/admin/analytics/performance-metrics"
              sx={{ 
                px: 2, 
                py: 1, 
                bgcolor: 'primary.main', 
                color: 'white', 
                borderRadius: 1,
                textDecoration: 'none',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Performance Metrics
            </Box>
            <Box 
              component="a" 
              href="/admin/analytics/user-behavior"
              sx={{ 
                px: 2, 
                py: 1, 
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                textDecoration: 'none',
                '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              User Behavior
            </Box>
          </Box>
        </Box>
      </Paper>
    </AdminLayout>
  );
};

export default AdminAnalytics;
