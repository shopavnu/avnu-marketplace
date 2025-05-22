import React from "react";
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  DateRange as DateRangeIcon,
  Category as CategoryIcon,
  FilterAlt as FilterIcon,
  PhoneIphone as DeviceIcon,
  FileDownload as ExportIcon,
  Refresh as RefreshIcon,
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
  Code as JsonIcon,
  InsertDriveFile as CsvIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from "@mui/icons-material";
import { GridContainer, GridItem } from "../ui/Grid";

// Props interface for the AnalyticsFilters component
interface AnalyticsFiltersProps {
  onFilterChange: (filters: AnalyticsFilterValues) => void;
  availableFilters?: AvailableFilterOptions;
  initialValues?: AnalyticsFilterValues;
}

// Available filter options that can be passed to customize the filter component
export interface AvailableFilterOptions {
  dateRanges?: boolean;
  categories?: boolean;
  platforms?: boolean;
  merchants?: boolean;
  comparison?: boolean;
  exportFormats?: string[];
}

// The actual filter values that will be returned via the callback
export interface AnalyticsFilterValues {
  dateRange: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  platform?: string;
  merchant?: string;
  comparisonType?: string;
  customDateRange?: {
    start: string;
    end: string;
  };
}

// Default filter options if none provided
const defaultFilterOptions: AvailableFilterOptions = {
  dateRanges: true,
  categories: true,
  platforms: true,
  merchants: true,
  comparison: true,
  exportFormats: ["CSV", "PDF", "Excel"],
};

// Default filter values if none provided
const defaultFilterValues: AnalyticsFilterValues = {
  dateRange: "30days",
  category: "all",
  platform: "all",
  merchant: "all",
  comparisonType: "previous",
};

/**
 * Reusable component for standardized analytics filtering across dashboards
 */
const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onFilterChange,
  availableFilters = defaultFilterOptions,
  initialValues = {},
}) => {
  // Merge initial values with defaults
  const defaultFilterValues: AnalyticsFilterValues = {
    dateRange: "30days",
    category: "all",
    platform: "all",
    merchant: "all",
    comparisonType: "none",
    customDateRange: {
      start: "",
      end: "",
    },
    ...initialValues,
  };

  const [filterValues, setFilterValues] =
    React.useState<AnalyticsFilterValues>(defaultFilterValues);
  const [showCustomDateRange, setShowCustomDateRange] = React.useState(false);

  // Export dropdown state
  const [exportAnchorEl, setExportAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const exportMenuOpen = Boolean(exportAnchorEl);

  // Handle opening the export menu
  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  // Handle closing the export menu
  const handleExportClose = () => {
    setExportAnchorEl(null);
  };

  // Handle filter changes
  const handleFilterChange = (
    property: keyof AnalyticsFilterValues,
    value: string,
  ) => {
    const newFilters = { ...filterValues, [property]: value };

    // Show/hide custom date range as needed
    if (property === "dateRange" && value === "custom") {
      setShowCustomDateRange(true);
    } else if (property === "dateRange") {
      setShowCustomDateRange(false);
    }

    setFilterValues(newFilters);
    onFilterChange(newFilters);
  };

  // Handle custom date range changes
  const handleCustomDateChange = (type: "start" | "end", value: string) => {
    const customDateRange = {
      ...filterValues.customDateRange,
      [type]: value,
    };

    const newFilters = {
      ...filterValues,
      customDateRange: customDateRange as any,
    };

    setFilterValues(newFilters);
    onFilterChange(newFilters);
  };

  // Handle export functionality
  const handleExport = (format: string) => {
    // In a real implementation, this would trigger the export process
    console.log(
      `Exporting data in ${format} format with filters:`,
      filterValues,
    );
    alert(`Analytics data export started in ${format} format.`);
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(filterValues);
  };

  // Reset filters to defaults
  const resetFilters = () => {
    setFilterValues(defaultFilterValues);
    setShowCustomDateRange(false);
    onFilterChange(defaultFilterValues);
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          <FilterIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Analytics Filters
        </Typography>
        <Box>
          <Tooltip title="Refresh Data">
            <IconButton color="primary" onClick={resetFilters}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>

          {availableFilters.exportFormats &&
            availableFilters.exportFormats.length > 0 && (
              <>
                <Tooltip title="Export Data">
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<ExportIcon />}
                    endIcon={<ArrowDownIcon />}
                    onClick={handleExportClick}
                    sx={{ ml: 1 }}
                  >
                    Export
                  </Button>
                </Tooltip>
                <Menu
                  anchorEl={exportAnchorEl}
                  open={exportMenuOpen}
                  onClose={handleExportClose}
                >
                  {availableFilters.exportFormats.map((format) => {
                    let icon;
                    switch (format.toUpperCase()) {
                      case "CSV":
                        icon = <CsvIcon />;
                        break;
                      case "EXCEL":
                        icon = <ExcelIcon />;
                        break;
                      case "PDF":
                        icon = <PdfIcon />;
                        break;
                      case "JSON":
                        icon = <JsonIcon />;
                        break;
                      default:
                        icon = <ExportIcon />;
                    }

                    return (
                      <MenuItem
                        key={format}
                        onClick={() => {
                          handleExport(format);
                          handleExportClose();
                        }}
                      >
                        <ListItemIcon>{icon}</ListItemIcon>
                        <ListItemText>{format}</ListItemText>
                      </MenuItem>
                    );
                  })}
                </Menu>
              </>
            )}
        </Box>
      </Box>

      <GridContainer spacing={2}>
        {/* Date range filters */}
        {availableFilters.dateRanges && (
          <>
            <GridItem xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-range-label">
                  <DateRangeIcon sx={{ fontSize: 16, mr: 1 }} />
                  Date Range
                </InputLabel>
                <Select
                  labelId="date-range-label"
                  id="date-range"
                  value={filterValues.dateRange}
                  label="Date Range"
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                  <MenuItem value="year">Last Year</MenuItem>
                  <MenuItem value="ytd">Year-to-Date</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </GridItem>

            {/* Custom date range fields */}
            {showCustomDateRange && (
              <>
                <GridItem xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filterValues.customDateRange?.start || ""}
                    onChange={(e) =>
                      handleCustomDateChange("start", e.target.value)
                    }
                  />
                </GridItem>
                <GridItem xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={filterValues.customDateRange?.end || ""}
                    onChange={(e) =>
                      handleCustomDateChange("end", e.target.value)
                    }
                  />
                </GridItem>
              </>
            )}
          </>
        )}

        {/* Category filter */}
        {availableFilters.categories && (
          <GridItem xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">
                <CategoryIcon sx={{ fontSize: 16, mr: 1 }} />
                Category
              </InputLabel>
              <Select
                labelId="category-filter-label"
                id="category-filter"
                value={filterValues.category}
                label="Category"
                onChange={(e) => handleFilterChange("category", e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="electronics">Electronics</MenuItem>
                <MenuItem value="fashion">Fashion</MenuItem>
                <MenuItem value="home">Home & Garden</MenuItem>
                <MenuItem value="beauty">Beauty</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="books">Books & Media</MenuItem>
                <MenuItem value="food">Food & Beverage</MenuItem>
              </Select>
            </FormControl>
          </GridItem>
        )}

        {/* Platform filter */}
        {availableFilters.platforms && (
          <GridItem xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="platform-filter-label">
                <DeviceIcon sx={{ fontSize: 16, mr: 1 }} />
                Platform
              </InputLabel>
              <Select
                labelId="platform-filter-label"
                id="platform-filter"
                value={filterValues.platform}
                label="Platform"
                onChange={(e) => handleFilterChange("platform", e.target.value)}
              >
                <MenuItem value="all">All Platforms</MenuItem>
                <MenuItem value="web">Web</MenuItem>
                <MenuItem value="mobile-app">Mobile App</MenuItem>
                <MenuItem value="ios">iOS</MenuItem>
                <MenuItem value="android">Android</MenuItem>
                <MenuItem value="tablet">Tablet</MenuItem>
              </Select>
            </FormControl>
          </GridItem>
        )}

        {/* Merchant filter */}
        {availableFilters.merchants && (
          <GridItem xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="merchant-filter-label">Merchant</InputLabel>
              <Select
                labelId="merchant-filter-label"
                id="merchant-filter"
                value={filterValues.merchant}
                label="Merchant"
                onChange={(e) => handleFilterChange("merchant", e.target.value)}
              >
                <MenuItem value="all">All Merchants</MenuItem>
                <MenuItem value="top10">Top 10 Merchants</MenuItem>
                <MenuItem value="top50">Top 50 Merchants</MenuItem>
                <MenuItem value="new">New Merchants</MenuItem>
                {/* Ideally this would be populated from an API */}
                <MenuItem value="merchant1">Tech Galaxy Store</MenuItem>
                <MenuItem value="merchant2">Fashion Forward</MenuItem>
                <MenuItem value="merchant3">Home Essentials</MenuItem>
              </Select>
            </FormControl>
          </GridItem>
        )}

        {/* Comparison type (vs. previous period, vs. industry benchmark, etc) */}
        {availableFilters.comparison && (
          <GridItem xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="comparison-filter-label">Benchmark</InputLabel>
              <Select
                labelId="comparison-filter-label"
                id="comparison-filter"
                value={filterValues.comparisonType}
                label="Benchmark"
                onChange={(e) =>
                  handleFilterChange("comparisonType", e.target.value)
                }
              >
                <MenuItem value="previous">vs. Previous Period</MenuItem>
                <MenuItem value="industry">vs. Industry Average</MenuItem>
                <MenuItem value="target">vs. Target KPIs</MenuItem>
                <MenuItem value="yoy">Year-over-Year</MenuItem>
                <MenuItem value="none">No Comparison</MenuItem>
              </Select>
            </FormControl>
          </GridItem>
        )}
      </GridContainer>

      {/* Filter action buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={resetFilters}
          sx={{ mr: 1 }}
        >
          Reset
        </Button>
        <Button variant="contained" color="primary" onClick={applyFilters}>
          Apply Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default AnalyticsFilters;
