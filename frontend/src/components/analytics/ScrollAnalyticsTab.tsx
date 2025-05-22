import React from "react";
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
} from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { format } from "date-fns";
import { Grid as GridContainer, Grid as GridItem } from "../ui/MuiGrid";

import { ScrollAnalyticsData } from "./types";

// Define props interface
interface ScrollAnalyticsTabProps {
  data: ScrollAnalyticsData;
  loading?: boolean;
}

// Define scroll analytics tab component
const ScrollAnalyticsTab: React.FC<ScrollAnalyticsTabProps> = ({ data }) => {
  // Format percentage
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Format time in seconds
  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
    }
  };

  return (
    <GridContainer spacing={3}>
      {/* Scroll Depth Overview */}
      <GridItem xs={12} sm={6} md={6}>
        <Card>
          <CardHeader title="Average Scroll Depth by Page" />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.scrollDepthByPage.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    type="number"
                    domain={[0, 1]}
                    tickFormatter={formatPercentage}
                  />
                  <YAxis
                    dataKey="pagePath"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.length > 25 ? `${value.substring(0, 25)}...` : value
                    }
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatPercentage(value),
                      "Avg Scroll Depth",
                    ]}
                    labelFormatter={(label) => `Page: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="avgScrollDepth"
                    name="Avg Scroll Depth"
                    fill="#8884d8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Scroll Time Overview */}
      <GridItem xs={12} sm={6} md={6}>
        <Card>
          <CardHeader title="Average Time Spent by Page" />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.timeSpentByPage.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit="s" />
                  <YAxis
                    dataKey="pagePath"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.length > 25 ? `${value.substring(0, 25)}...` : value
                    }
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      formatTime(value),
                      "Avg Time Spent",
                    ]}
                    labelFormatter={(label) => `Page: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="avgTimeSpent"
                    name="Avg Time Spent"
                    fill="#82ca9d"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Scroll Depth Distribution */}
      <GridItem xs={12}>
        <Card>
          <CardHeader title="Scroll Depth Distribution" />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data.scrollDepthDistribution}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="depthPercentage"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    label={{
                      value: "Session Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value: any) => [value, "Sessions"]}
                    labelFormatter={(label) => `Scroll Depth: ${label}%`}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="sessionCount"
                    name="Sessions"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Scroll Pause Points */}
      <GridItem xs={12} sm={6} md={6}>
        <Card>
          <CardHeader title="Common Scroll Pause Points" />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.scrollPausePoints.slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="scrollPosition"
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis
                    label={{
                      value: "Pause Count",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    formatter={(value: any) => [value, "Pauses"]}
                    labelFormatter={(label) => `Scroll Position: ${label}%`}
                  />
                  <Legend />
                  <Bar dataKey="pauseCount" name="Pause Count" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Scroll Velocity */}
      <GridItem xs={12} sm={6} md={6}>
        <Card>
          <CardHeader title="Average Scroll Velocity by Page" />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.scrollVelocityByPage.slice(0, 10)}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" unit="px/s" />
                  <YAxis
                    dataKey="pagePath"
                    type="category"
                    width={150}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) =>
                      value.length > 25 ? `${value.substring(0, 25)}...` : value
                    }
                  />
                  <Tooltip
                    formatter={(value: any) => [
                      `${value.toFixed(1)} px/s`,
                      "Avg Scroll Velocity",
                    ]}
                    labelFormatter={(label) => `Page: ${label}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="avgScrollVelocity"
                    name="Avg Scroll Velocity"
                    fill="#FFBB28"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Scroll Trends */}
      <GridItem xs={12}>
        <Card>
          <CardHeader title="Scroll Depth Trends" />
          <CardContent>
            <Box height={400}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.scrollTrends}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => {
                      try {
                        return format(new Date(value), "MM/dd");
                      } catch (e) {
                        return value;
                      }
                    }}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 1]}
                    tickFormatter={formatPercentage}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    dataKey="sessionCount"
                  />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === "Avg Scroll Depth")
                        return [formatPercentage(value), name];
                      if (name === "Session Count") return [value, name];
                      return [value, name];
                    }}
                    labelFormatter={(label) => {
                      try {
                        return format(new Date(label), "MMM dd, yyyy");
                      } catch (e) {
                        return label;
                      }
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgScrollDepth"
                    name="Avg Scroll Depth"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="sessionCount"
                    name="Session Count"
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </GridItem>

      {/* Detailed Scroll Data */}
      <GridItem xs={12}>
        <Card>
          <CardHeader title="Detailed Scroll Data" />
          <CardContent>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Page Path</TableCell>
                    <TableCell align="right">Avg Scroll Depth</TableCell>
                    <TableCell align="right">Max Scroll Depth</TableCell>
                    <TableCell align="right">Avg Time Spent</TableCell>
                    <TableCell align="right">Bounce Rate</TableCell>
                    <TableCell align="right">Session Count</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.detailedScrollData
                    .slice(0, 15)
                    .map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.pagePath}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(item.avgScrollDepth)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(item.maxScrollDepth)}
                        </TableCell>
                        <TableCell align="right">
                          {formatTime(item.avgTimeSpent)}
                        </TableCell>
                        <TableCell align="right">
                          {formatPercentage(item.bounceRate)}
                        </TableCell>
                        <TableCell align="right">{item.sessionCount}</TableCell>
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

export default ScrollAnalyticsTab;
