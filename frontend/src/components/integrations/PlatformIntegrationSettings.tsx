import React, { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";

import { TrashIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

import { usePlatformConnections } from "../../hooks/usePlatformConnections";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`platform-tabpanel-${index}`}
      aria-labelledby={`platform-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const PlatformIntegrationSettings: React.FC = () => {
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState<string | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    connections,
    loading,
    error,
    connectToShopify,
    disconnectPlatform,
    syncPlatform,
  } = usePlatformConnections();

  // Tabs removed as part of Shopify-first approach

  const handleShopifyConnect = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!shopifyDomain) {
      setErrorMessage("Please enter a Shopify domain");
      return;
    }

    try {
      const url = await connectToShopify(shopifyDomain);
      // Redirect to Shopify OAuth page
      window.location.href = url;
    } catch (err) {
      setErrorMessage("Failed to connect to Shopify");
      console.error(err);
    }
  };

  // Legacy integrations have been removed as part of our Shopify-first approach

  const handleDisconnect = (connectionId: string) => {
    setConnectionToDelete(connectionId);
    setOpenDialog(true);
  };

  const confirmDisconnect = async () => {
    if (!connectionToDelete) return;

    try {
      const success = await disconnectPlatform(connectionToDelete);
      if (success) {
        setSuccessMessage("Platform disconnected successfully");
      }
    } catch (err) {
      setErrorMessage("Failed to disconnect platform");
      console.error(err);
    } finally {
      setOpenDialog(false);
      setConnectionToDelete(null);
    }
  };

  const handleSync = async (connectionId: string) => {
    try {
      await syncPlatform(connectionId);
      setSuccessMessage("Synchronization started");
    } catch (err) {
      setErrorMessage("Failed to start synchronization");
      console.error(err);
    }
  };

  const handleCloseSnackbar = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>

      <Card>
        <CardHeader title="Connected Platforms" />
        <Divider />
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : connections.length === 0 ? (
            <Alert severity="info">
              No platforms connected yet. Connect to Shopify below.
            </Alert>
          ) : (
            <List>
              {connections.map((connection) => (
                <ListItem key={connection.id}>
                  <ListItemText
                    primary={
                      connection.platformStoreName ||
                      connection.platformStoreUrl
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {connection.platformType.charAt(0).toUpperCase() +
                            connection.platformType.slice(1)}
                        </Typography>
                        {` — ${connection.platformStoreUrl}`}
                        <br />
                        {connection.lastSyncedAt
                          ? `Last synced: ${new Date(connection.lastSyncedAt).toLocaleString()}`
                          : "Never synced"}
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="refresh"
                      onClick={() => handleSync(connection.id)}
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </IconButton>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDisconnect(connection.id)}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Box sx={{ width: "100%", mb: 3, mt: 3 }}>
        <Card>
          <CardHeader title="Connect to Shopify" />
          <Divider />

          <Box sx={{ p: 3 }}>
            <form onSubmit={handleShopifyConnect}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6">
                    Connect your Shopify store
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Enter your Shopify domain to connect your store.
                  </Typography>
                </Box>
                <Box sx={{ maxWidth: 500 }}>
                  <TextField
                    fullWidth
                    label="Shopify Domain"
                    placeholder="your-store.myshopify.com"
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    required
                    helperText="Enter your *.myshopify.com domain"
                  />
                </Box>
                <Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading || !shopifyDomain}
                  >
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Connect to Shopify"
                    )}
                  </Button>
                </Box>
              </Stack>
            </form>
          </Box>
        </Card>
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Disconnect Platform</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to disconnect this platform? This will stop
            all synchronization of products and orders.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDisconnect} color="error" autoFocus>
            Disconnect
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PlatformIntegrationSettings;
