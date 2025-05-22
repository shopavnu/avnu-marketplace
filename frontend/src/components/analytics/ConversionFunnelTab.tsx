import React, { useState } from "react";
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
  Tabs,
  Tab,
  SelectChangeEvent,
} from "@mui/material";
import { Grid as GridContainer, Grid as GridItem } from "../ui/MuiGrid";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sankey,
  Tooltip as RechartsTooltip,
  Rectangle,
  Label,
  Cell,
} from "recharts";

import { ConversionFunnelData } from "./types";

// Define props interface
interface ConversionFunnelTabProps {
  data: ConversionFunnelData;
  loading?: boolean;
}

// Define tab panel component
function TabPanel(props: any) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`funnel-tabpanel-${index}`}
      aria-labelledby={`funnel-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Define conversion funnel tab component
const ConversionFunnelTab: React.FC<ConversionFunnelTabProps> = ({ data }) => {
  // State for selected funnel
  const [selectedFunnel, setSelectedFunnel] = useState<string>(
    data?.funnelTypes?.[0]?.value || "product_detail",
  );

  // State for tab value
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (
    event: React.SyntheticEvent,
    newValue: number,
  ): void => {
    setTabValue(newValue);
  };

  // Format percentage
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Get funnel data for selected funnel type
  const getFunnelData = () => {
    return (
      data?.funnels?.find(
        (funnel: any) => funnel.funnelType === selectedFunnel,
      ) || null
    );
  };

  // Get current funnel data
  const currentFunnel = getFunnelData();

  // Render vertical funnel visualization
  const renderVerticalFunnel = () => {
    if (!currentFunnel) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography variant="h6" color="text.secondary">
            No funnel data available
          </Typography>
        </Box>
      );
    }

    // Prepare data for the vertical funnel
    const funnelSteps = currentFunnel.steps.map((step: any, index: number) => ({
      name: step.name,
      value: step.count,
      fill:
        index === 0
          ? "#8884d8"
          : index === currentFunnel.steps.length - 1
            ? "#82ca9d"
            : `rgba(${136 - index * 10}, ${132 - index * 5}, ${216 - index * 20}, ${1 - index * 0.1})`,
      dropoff:
        index < currentFunnel.steps.length - 1
          ? currentFunnel.steps[index].count -
            currentFunnel.steps[index + 1].count
          : 0,
      conversionRate:
        index < currentFunnel.steps.length - 1
          ? currentFunnel.steps[index + 1].count /
            currentFunnel.steps[index].count
          : 1,
    }));

    return (
      <Box height={500} width="100%">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={funnelSteps}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 150, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: any, name: string, props: any) => {
                if (name === "value") return [value, "Users"];
                if (name === "dropoff") return [value, "Dropoff"];
                return [value, name];
              }}
              labelFormatter={(label) => `Step: ${label}`}
            />
            <Legend />
            <Bar
              dataKey="value"
              name="Users"
              fill="#8884d8"
              background={{ fill: "#eee" }}
              radius={[0, 4, 4, 0]}
            >
              {funnelSteps.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              {funnelSteps.map((entry: any, index: number) => {
                if (index < funnelSteps.length - 1) {
                  return (
                    <Label
                      key={`label-${index}`}
                      position="right"
                      content={(props: any) => {
                        const { x, y, width, height, value } = props;
                        return (
                          <g>
                            <text
                              x={x + width + 10}
                              y={y + height / 2}
                              fill="#666"
                              textAnchor="start"
                              dominantBaseline="middle"
                            >
                              {formatPercentage(entry.conversionRate)} →
                            </text>
                          </g>
                        );
                      }}
                    />
                  );
                }
                return null;
              })}
            </Bar>
            <Bar
              dataKey="dropoff"
              name="Dropoff"
              fill="#FF8042"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    );
  };

  // Render funnel metrics
  const renderFunnelMetrics = () => {
    if (!currentFunnel) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography variant="h6" color="text.secondary">
            No funnel data available
          </Typography>
        </Box>
      );
    }

    // Calculate overall conversion rate
    const overallConversionRate =
      currentFunnel.steps.length > 1
        ? currentFunnel.steps[currentFunnel.steps.length - 1].count /
          currentFunnel.steps[0].count
        : 1;

    // Calculate step conversion rates
    const stepConversionRates = currentFunnel.steps
      .map((step: any, index: number) => {
        if (index < currentFunnel.steps.length - 1) {
          return {
            fromStep: step.name,
            toStep: currentFunnel.steps[index + 1].name,
            conversionRate: currentFunnel.steps[index + 1].count / step.count,
            dropoffCount: step.count - currentFunnel.steps[index + 1].count,
          };
        }
        return null;
      })
      .filter(Boolean);

    return (
      <GridContainer spacing={2}>
        {/* Overall Funnel Metrics */}
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Overall Funnel Metrics" />
            <CardContent>
              <GridContainer spacing={2}>
                <GridItem xs={12} md={3}>
                  <Box
                    textAlign="center"
                    p={2}
                    bgcolor="#f5f5f5"
                    borderRadius={1}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Initial Users
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {currentFunnel.steps[0].count}
                    </Typography>
                  </Box>
                </GridItem>
                <GridItem xs={12} md={3}>
                  <Box
                    textAlign="center"
                    p={2}
                    bgcolor="#f5f5f5"
                    borderRadius={1}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Converted Users
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {
                        currentFunnel.steps[currentFunnel.steps.length - 1]
                          .count
                      }
                    </Typography>
                  </Box>
                </GridItem>
                <GridItem xs={12} md={3}>
                  <Box
                    textAlign="center"
                    p={2}
                    bgcolor="#f5f5f5"
                    borderRadius={1}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Conversion Rate
                    </Typography>
                    <Typography
                      variant="h4"
                      color={
                        overallConversionRate > 0.2
                          ? "success.main"
                          : "warning.main"
                      }
                    >
                      {formatPercentage(overallConversionRate)}
                    </Typography>
                  </Box>
                </GridItem>
                <GridItem xs={12} md={3}>
                  <Box
                    textAlign="center"
                    p={2}
                    bgcolor="#f5f5f5"
                    borderRadius={1}
                  >
                    <Typography variant="h6" color="text.secondary">
                      Total Dropoff
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {currentFunnel.steps[0].count -
                        currentFunnel.steps[currentFunnel.steps.length - 1]
                          .count}
                    </Typography>
                  </Box>
                </GridItem>
              </GridContainer>
            </CardContent>
          </Card>
        </GridItem>

        {/* Step Conversion Rates */}
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Step Conversion Rates" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>From Step</TableCell>
                      <TableCell>To Step</TableCell>
                      <TableCell align="right">Conversion Rate</TableCell>
                      <TableCell align="right">Dropoff Count</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stepConversionRates.map((rate: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{rate.fromStep}</TableCell>
                        <TableCell>{rate.toStep}</TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              rate.conversionRate > 0.5
                                ? "success.main"
                                : rate.conversionRate > 0.2
                                  ? "warning.main"
                                  : "error.main",
                          }}
                        >
                          {formatPercentage(rate.conversionRate)}
                        </TableCell>
                        <TableCell align="right">{rate.dropoffCount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
    );
  };

  // Render funnel comparison
  const renderFunnelComparison = () => {
    if (!data?.funnelComparison) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <Typography variant="h6" color="text.secondary">
            No comparison data available
          </Typography>
        </Box>
      );
    }

    return (
      <GridContainer spacing={2}>
        {/* Conversion Rate by Device */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Conversion Rate by Device Type" />
            <CardContent>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.funnelComparison.byDeviceType}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="deviceType" />
                    <YAxis domain={[0, 1]} tickFormatter={formatPercentage} />
                    <Tooltip
                      formatter={(value: any) => [
                        formatPercentage(value),
                        "Conversion Rate",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="conversionRate"
                      name="Conversion Rate"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        {/* Conversion Rate by Time */}
        <GridItem xs={12} md={6}>
          <Card>
            <CardHeader title="Conversion Rate by Time of Day" />
            <CardContent>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.funnelComparison.byTimeOfDay}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timeRange" />
                    <YAxis domain={[0, 1]} tickFormatter={formatPercentage} />
                    <Tooltip
                      formatter={(value: any) => [
                        formatPercentage(value),
                        "Conversion Rate",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="conversionRate"
                      name="Conversion Rate"
                      fill="#82ca9d"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>

        {/* Conversion Rate Trends */}
        <GridItem xs={12}>
          <Card>
            <CardHeader title="Conversion Rate Trends" />
            <CardContent>
              <Box height={300}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.funnelComparison.trends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[0, 1]} tickFormatter={formatPercentage} />
                    <Tooltip
                      formatter={(value: any) => [
                        formatPercentage(value),
                        "Conversion Rate",
                      ]}
                    />
                    <Legend />
                    <Bar
                      dataKey="conversionRate"
                      name="Conversion Rate"
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </GridItem>
      </GridContainer>
    );
  };

  return (
    <GridContainer spacing={3}>
      {/* Funnel Selection */}
      <GridItem xs={12}>
        <Card>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel id="funnel-select-label">Select Funnel</InputLabel>
              <Select
                labelId="funnel-select-label"
                id="funnel-select"
                value={selectedFunnel}
                label="Select Funnel"
                onChange={(e: SelectChangeEvent) =>
                  setSelectedFunnel(e.target.value as string)
                }
              >
                {data?.funnelTypes?.map((funnel: any, index: number) => (
                  <MenuItem key={index} value={funnel.value}>
                    {funnel.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>
      </GridItem>

      {/* Vertical Funnel Visualization */}
      <GridItem xs={12}>
        <Card>
          <CardHeader
            title={`Vertical Funnel: ${data?.funnelTypes?.find((f: any) => f.value === selectedFunnel)?.label || selectedFunnel}`}
            subheader="Showing user progression through vertical content sections"
          />
          <CardContent>{renderVerticalFunnel()}</CardContent>
        </Card>
      </GridItem>

      {/* Funnel Analysis Tabs */}
      <GridItem xs={12}>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="funnel analysis tabs"
            >
              <Tab
                label="Funnel Metrics"
                id="funnel-tab-0"
                aria-controls="funnel-tabpanel-0"
              />
              <Tab
                label="Funnel Comparison"
                id="funnel-tab-1"
                aria-controls="funnel-tabpanel-1"
              />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            {renderFunnelMetrics()}
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {renderFunnelComparison()}
          </TabPanel>
        </Card>
      </GridItem>
    </GridContainer>
  );
};

export default ConversionFunnelTab;
