import React from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
  Button,
} from "@mui/material";
import {
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

// Types of anomalies we can detect
export enum AnomalyType {
  SPIKE = "spike",
  DROP = "drop",
  TREND_CHANGE = "trend_change",
  OUTLIER = "outlier",
  THRESHOLD_BREACH = "threshold_breach",
}

// Severity levels for anomalies
export enum AnomalySeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Interface for a detected anomaly
export interface Anomaly {
  id: string;
  type: AnomalyType;
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number; // percentage deviation
  timestamp: string;
  severity: AnomalySeverity;
  description: string;
  affectedSegment?: string; // e.g., "Mobile Users", "Electronics Category"
  recommendation?: string;
}

// Props for the AnomalyAlerts component
interface AnomalyAlertsProps {
  anomalies: Anomaly[];
  onDismiss?: (id: string) => void;
  onViewAll?: () => void;
}

/**
 * Component to display anomaly detection alerts across analytics dashboards
 */
const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({
  anomalies,
  onDismiss,
  onViewAll,
}) => {
  const [expanded, setExpanded] = React.useState(true);

  // No anomalies to show
  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  // Get severity-based counts
  const criticalCount = anomalies.filter(
    (a) => a.severity === AnomalySeverity.CRITICAL,
  ).length;
  const highCount = anomalies.filter(
    (a) => a.severity === AnomalySeverity.HIGH,
  ).length;

  // Get color based on anomaly severity
  const getSeverityColor = (severity: AnomalySeverity) => {
    switch (severity) {
      case AnomalySeverity.CRITICAL:
        return "error";
      case AnomalySeverity.HIGH:
        return "error";
      case AnomalySeverity.MEDIUM:
        return "warning";
      case AnomalySeverity.LOW:
        return "info";
      default:
        return "default";
    }
  };

  // Get icon based on anomaly type
  const getAnomalyIcon = (type: AnomalyType) => {
    switch (type) {
      case AnomalyType.SPIKE:
        return <TrendingUpIcon color="error" />;
      case AnomalyType.DROP:
        return <TrendingDownIcon color="error" />;
      case AnomalyType.TREND_CHANGE:
        return <TrendingUpIcon color="warning" />;
      case AnomalyType.OUTLIER:
        return <WarningIcon color="warning" />;
      case AnomalyType.THRESHOLD_BREACH:
        return <WarningIcon color="error" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  return (
    <Paper sx={{ mb: 3, overflow: "hidden" }}>
      {/* Header with counts and expand/collapse control */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor:
            criticalCount > 0
              ? "error.light"
              : highCount > 0
                ? "warning.light"
                : "info.light",
          color:
            criticalCount > 0
              ? "error.contrastText"
              : highCount > 0
                ? "warning.contrastText"
                : "info.contrastText",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <NotificationsIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            Anomaly Alerts ({anomalies.length})
          </Typography>

          {criticalCount > 0 && (
            <Chip
              label={`${criticalCount} Critical`}
              color="error"
              size="small"
              sx={{ ml: 1 }}
            />
          )}

          {highCount > 0 && (
            <Chip
              label={`${highCount} High`}
              color="warning"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{ color: "inherit" }}
        >
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      {/* Collapsible anomaly list */}
      <Collapse in={expanded}>
        <List sx={{ p: 0 }}>
          {anomalies.map((anomaly, index) => (
            <React.Fragment key={anomaly.id}>
              {index > 0 && <Divider />}
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  onDismiss && (
                    <IconButton
                      edge="end"
                      aria-label="dismiss"
                      onClick={() => onDismiss(anomaly.id)}
                    >
                      <CloseIcon />
                    </IconButton>
                  )
                }
              >
                <ListItemIcon>{getAnomalyIcon(anomaly.type)}</ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="subtitle1" component="span">
                        {anomaly.metric}
                      </Typography>
                      <Chip
                        label={anomaly.severity}
                        color={getSeverityColor(anomaly.severity) as any}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        component="span"
                        color="text.primary"
                      >
                        {anomaly.description}
                      </Typography>
                      <Typography
                        variant="body2"
                        display="block"
                        color="text.secondary"
                      >
                        Current: {anomaly.value.toLocaleString()} | Expected:{" "}
                        {anomaly.expectedValue.toLocaleString()} | Deviation:{" "}
                        {anomaly.deviation > 0 ? "+" : ""}
                        {anomaly.deviation.toFixed(1)}%
                      </Typography>
                      {anomaly.affectedSegment && (
                        <Typography variant="body2" color="text.secondary">
                          Segment: {anomaly.affectedSegment}
                        </Typography>
                      )}
                      {anomaly.recommendation && (
                        <Alert
                          severity="info"
                          sx={{ mt: 1, fontSize: "0.875rem" }}
                        >
                          <strong>Recommendation:</strong>{" "}
                          {anomaly.recommendation}
                        </Alert>
                      )}
                    </>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>

        {/* "View All" button */}
        {onViewAll && (
          <Box sx={{ p: 2, textAlign: "center" }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={onViewAll}
              endIcon={<ExpandMoreIcon />}
            >
              View All Anomalies
            </Button>
          </Box>
        )}
      </Collapse>
    </Paper>
  );
};

export default AnomalyAlerts;
