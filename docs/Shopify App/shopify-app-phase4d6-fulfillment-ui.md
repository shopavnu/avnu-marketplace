# Phase 4D-6: Fulfillment Management - UI Components

## Objectives

- Implement user interface for fulfillment management
- Create fulfillment creation workflow
- Display tracking information to merchants

## Timeline: Week 18

## Tasks & Implementation Details

### 1. Fulfillment Management Routes

Set up Remix routes for fulfillment management:

```typescript
// app/routes/app.orders.$id.fulfillments.tsx

import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Page, Card, Layout, Stack, Badge, Button, Icon } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { FulfillmentList } from "~/components/fulfillments/FulfillmentList";
import { getFulfillmentsForOrder } from "~/api/fulfillment";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  
  if (!id) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }
  
  try {
    const fulfillments = await getFulfillmentsForOrder(session, id);
    return json({ fulfillments });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

export default function OrderFulfillments() {
  const { fulfillments, error } = useLoaderData<typeof loader>();
  
  return (
    <Page
      backAction={{ content: "Back to Order", url: `/app/orders/${params.id}` }}
      title="Fulfillments"
      primaryAction={{
        content: "Create Fulfillment",
        url: `/app/orders/${params.id}/fulfillments/new`
      }}
    >
      <Layout>
        {error ? (
          <Layout.Section>
            <Card>
              <Card.Section>
                <div className="error-message">{error}</div>
              </Card.Section>
            </Card>
          </Layout.Section>
        ) : (
          <Layout.Section>
            <Card>
              <FulfillmentList fulfillments={fulfillments} />
            </Card>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
}
```

### 2. Fulfillment Creation Route

Create the route for initiating a new fulfillment:

```typescript
// app/routes/app.orders.$id.fulfillments.new.tsx

import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { Page, Card, Layout, Form, FormLayout, TextField, Button, Stack, Select, Checkbox } from "@shopify/polaris";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { getOrderById } from "~/api/order";
import { getShippingCarriers } from "~/api/shipping";
import { createFulfillment } from "~/api/fulfillment";
import { FulfillmentLineItemSelector } from "~/components/fulfillments/FulfillmentLineItemSelector";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  
  if (!id) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }
  
  try {
    const order = await getOrderById(session, id);
    const carriers = await getShippingCarriers(session);
    
    return json({ order, carriers });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id } = params;
  
  if (!id) {
    return json({ error: "Order ID is required" }, { status: 400 });
  }
  
  const formData = await request.formData();
  const lineItems = JSON.parse(formData.get("lineItems") as string);
  const trackingCompany = formData.get("trackingCompany") as string;
  const trackingNumber = formData.get("trackingNumber") as string;
  const trackingUrl = formData.get("trackingUrl") as string;
  const notifyCustomer = formData.get("notifyCustomer") === "true";
  
  try {
    // Ensure at least one line item is selected
    if (!lineItems || lineItems.length === 0) {
      return json({ 
        formError: "Please select at least one item to fulfill" 
      }, { status: 400 });
    }
    
    await createFulfillment(session, {
      orderId: id,
      lineItems,
      trackingCompany,
      trackingNumber,
      trackingUrl,
      notifyCustomer
    });
    
    return redirect(`/app/orders/${id}/fulfillments`);
  } catch (error) {
    return json({ formError: error.message }, { status: 500 });
  }
};

export default function NewFulfillment() {
  const { order, carriers, error } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [trackingCompany, setTrackingCompany] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  
  const handleSubmit = (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append("lineItems", JSON.stringify(selectedItems));
    formData.append("trackingCompany", trackingCompany);
    formData.append("trackingNumber", trackingNumber);
    formData.append("trackingUrl", trackingUrl);
    formData.append("notifyCustomer", notifyCustomer.toString());
    
    submit(formData, { method: "post" });
  };
  
  // Additional state/handlers would be implemented here
  
  return (
    <Page
      backAction={{ content: "Back to Fulfillments", url: `/app/orders/${params.id}/fulfillments` }}
      title="Create Fulfillment"
    >
      <Layout>
        {error ? (
          <Layout.Section>
            <Card>
              <Card.Section>
                <div className="error-message">{error}</div>
              </Card.Section>
            </Card>
          </Layout.Section>
        ) : (
          <Form onSubmit={handleSubmit}>
            <Layout>
              <Layout.Section>
                <Card title="Items to Fulfill">
                  <Card.Section>
                    <FulfillmentLineItemSelector
                      lineItems={order.lineItems}
                      selectedItems={selectedItems}
                      onChange={setSelectedItems}
                    />
                  </Card.Section>
                </Card>
              </Layout.Section>
              
              <Layout.Section>
                <Card title="Tracking Information">
                  <Card.Section>
                    <FormLayout>
                      <Select
                        label="Shipping Carrier"
                        options={carriers.map(c => ({ label: c.name, value: c.value }))}
                        onChange={setTrackingCompany}
                        value={trackingCompany}
                      />
                      <TextField
                        label="Tracking Number"
                        value={trackingNumber}
                        onChange={setTrackingNumber}
                      />
                      <TextField
                        label="Tracking URL (optional)"
                        value={trackingUrl}
                        onChange={setTrackingUrl}
                      />
                      <Checkbox
                        label="Notify customer of shipment"
                        checked={notifyCustomer}
                        onChange={setNotifyCustomer}
                      />
                    </FormLayout>
                  </Card.Section>
                </Card>
              </Layout.Section>
              
              <Layout.Section>
                <Stack distribution="trailing">
                  <Button
                    onClick={() => navigate(`/app/orders/${params.id}/fulfillments`)}
                  >
                    Cancel
                  </Button>
                  <Button primary submit loading={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create Fulfillment"}
                  </Button>
                </Stack>
              </Layout.Section>
            </Layout>
          </Form>
        )}
      </Layout>
    </Page>
  );
}
```

### 3. Line Item Selector Component

Create a component for selecting line items to fulfill:

```typescript
// app/components/fulfillments/FulfillmentLineItemSelector.tsx

import { useState, useEffect } from "react";
import { ResourceList, ResourceItem, Thumbnail, TextStyle, Stack, Badge, TextField } from "@shopify/polaris";

export function FulfillmentLineItemSelector({ lineItems, selectedItems, onChange }) {
  const [quantities, setQuantities] = useState({});
  
  // Initialize quantities based on available items
  useEffect(() => {
    const initialQuantities = {};
    lineItems.forEach(item => {
      initialQuantities[item.id] = 0;
    });
    setQuantities(initialQuantities);
  }, [lineItems]);
  
  const handleSelectionChange = (itemId, isSelected) => {
    const newSelectedItems = [...selectedItems];
    
    if (isSelected) {
      // Add item if not already selected
      if (!newSelectedItems.find(item => item.id === itemId)) {
        const lineItem = lineItems.find(item => item.id === itemId);
        newSelectedItems.push({
          id: itemId,
          quantity: 1
        });
      }
    } else {
      // Remove item if selected
      const index = newSelectedItems.findIndex(item => item.id === itemId);
      if (index >= 0) {
        newSelectedItems.splice(index, 1);
      }
    }
    
    onChange(newSelectedItems);
  };
  
  const handleQuantityChange = (itemId, quantity) => {
    // Update quantity for the item
    const newSelectedItems = [...selectedItems];
    const index = newSelectedItems.findIndex(item => item.id === itemId);
    
    if (index >= 0) {
      newSelectedItems[index].quantity = parseInt(quantity, 10) || 0;
      onChange(newSelectedItems);
    }
  };
  
  return (
    <ResourceList
      resourceName={{ singular: "line item", plural: "line items" }}
      items={lineItems.filter(item => item.quantity > item.quantityFulfilled)}
      renderItem={(item) => {
        const { id, title, quantity, quantityFulfilled, sku, imageUrl } = item;
        const availableToFulfill = quantity - (quantityFulfilled || 0);
        const isSelected = selectedItems.some(selectedItem => selectedItem.id === id);
        const selectedQuantity = selectedItems.find(selectedItem => selectedItem.id === id)?.quantity || 0;
        
        return (
          <ResourceItem
            id={id}
            onClick={() => handleSelectionChange(id, !isSelected)}
            media={
              <Thumbnail
                source={imageUrl || "/images/placeholder-product.png"}
                alt={title}
              />
            }
          >
            <Stack>
              <Stack.Item fill>
                <h3>
                  <TextStyle variation="strong">{title}</TextStyle>
                </h3>
                <div>SKU: {sku || "N/A"}</div>
                <div>
                  <Badge status="info">
                    {availableToFulfill} of {quantity} remaining
                  </Badge>
                </div>
              </Stack.Item>
              <Stack.Item>
                <TextField
                  label="Quantity to fulfill"
                  type="number"
                  value={selectedQuantity.toString()}
                  onChange={(value) => handleQuantityChange(id, value)}
                  min={0}
                  max={availableToFulfill}
                  disabled={!isSelected}
                />
              </Stack.Item>
            </Stack>
          </ResourceItem>
        );
      }}
    />
  );
}
```

### 4. Fulfillment List Component

Create a component to display fulfillments:

```typescript
// app/components/fulfillments/FulfillmentList.tsx

import { ResourceList, ResourceItem, TextStyle, Badge, Stack, Link } from "@shopify/polaris";
import { formatDate } from "~/utils/dates";

// Helper function to get badge status based on fulfillment status
function getBadgeStatus(status) {
  switch (status) {
    case 'success':
      return 'success';
    case 'pending':
      return 'attention';
    case 'open':
      return 'info';
    case 'cancelled':
      return 'warning';
    case 'error':
    case 'failure':
      return 'critical';
    default:
      return 'default';
  }
}

export function FulfillmentList({ fulfillments }) {
  if (!fulfillments || fulfillments.length === 0) {
    return (
      <div className="empty-state">
        <p>No fulfillments found for this order.</p>
      </div>
    );
  }
  
  return (
    <ResourceList
      resourceName={{ singular: "fulfillment", plural: "fulfillments" }}
      items={fulfillments}
      renderItem={(fulfillment) => {
        const { 
          id, 
          status, 
          trackingCompany, 
          trackingNumber, 
          trackingUrl, 
          createdAt 
        } = fulfillment;
        
        return (
          <ResourceItem
            id={id}
            url={`/app/orders/${fulfillment.orderId}/fulfillments/${id}`}
          >
            <Stack>
              <Stack.Item fill>
                <h3>
                  <TextStyle variation="strong">
                    Fulfillment #{id.substring(0, 8)}
                  </TextStyle>
                </h3>
                <div>Created on {formatDate(createdAt)}</div>
                {trackingNumber && (
                  <div>
                    Tracking: {trackingCompany || 'Unknown carrier'} - {trackingNumber}
                    {trackingUrl && (
                      <span> (<Link url={trackingUrl} external>Track</Link>)</span>
                    )}
                  </div>
                )}
              </Stack.Item>
              <Stack.Item>
                <Badge status={getBadgeStatus(status)}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              </Stack.Item>
            </Stack>
          </ResourceItem>
        );
      }}
    />
  );
}
```

### 5. Fulfillment Detail Route

Create a route to view fulfillment details:

```typescript
// app/routes/app.orders.$orderId.fulfillments.$id.tsx

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import { Page, Card, Layout, Stack, Badge, Button, Banner, List, TextContainer } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { getFulfillmentById, cancelFulfillment } from "~/api/fulfillment";
import { formatDate } from "~/utils/dates";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id, orderId } = params;
  
  if (!id || !orderId) {
    return json({ error: "Fulfillment ID and Order ID are required" }, { status: 400 });
  }
  
  try {
    const fulfillment = await getFulfillmentById(session, id);
    return json({ fulfillment });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const { id, orderId } = params;
  
  if (!id || !orderId) {
    return json({ error: "Fulfillment ID and Order ID are required" }, { status: 400 });
  }
  
  const formData = await request.formData();
  const intent = formData.get("intent");
  
  if (intent === "cancel") {
    try {
      await cancelFulfillment(session, id);
      return json({ success: true });
    } catch (error) {
      return json({ error: error.message }, { status: 500 });
    }
  }
  
  return json({ error: "Invalid action" }, { status: 400 });
};

export default function FulfillmentDetail() {
  const { fulfillment, error } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this fulfillment?")) {
      const formData = new FormData();
      formData.append("intent", "cancel");
      submit(formData, { method: "post" });
    }
  };
  
  // Helper function to get status label
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': 'Pending',
      'open': 'Processing',
      'success': 'Fulfilled',
      'cancelled': 'Cancelled',
      'error': 'Error',
      'failure': 'Failed'
    };
    
    return statusMap[status] || status;
  };
  
  return (
    <Page
      backAction={{ content: "Back to Fulfillments", url: `/app/orders/${params.orderId}/fulfillments` }}
      title={`Fulfillment ${fulfillment?.id?.substring(0, 8) || ''}`}
      subtitle={fulfillment ? `Created on ${formatDate(fulfillment.createdAt)}` : ''}
      primaryAction={
        fulfillment && fulfillment.status !== 'cancelled' && (
          <Button destructive onClick={handleCancel} loading={isSubmitting}>
            Cancel Fulfillment
          </Button>
        )
      }
    >
      <Layout>
        {error ? (
          <Layout.Section>
            <Banner status="critical">{error}</Banner>
          </Layout.Section>
        ) : (
          <>
            <Layout.Section>
              <Card title="Fulfillment Details">
                <Card.Section>
                  <Stack distribution="equalSpacing">
                    <Stack.Item>
                      <TextContainer>
                        <p><strong>Status:</strong> <Badge status={getBadgeStatus(fulfillment.status)}>{getStatusLabel(fulfillment.status)}</Badge></p>
                        <p><strong>Created:</strong> {formatDate(fulfillment.createdAt)}</p>
                        {fulfillment.notifyCustomer && <p>Customer was notified</p>}
                      </TextContainer>
                    </Stack.Item>
                  </Stack>
                </Card.Section>
              </Card>
            </Layout.Section>
            
            <Layout.Section>
              <Card title="Tracking Information">
                <Card.Section>
                  {fulfillment.trackingNumber ? (
                    <TextContainer>
                      <p><strong>Carrier:</strong> {fulfillment.trackingCompany || 'Unknown carrier'}</p>
                      <p><strong>Tracking Number:</strong> {fulfillment.trackingNumber}</p>
                      {fulfillment.trackingUrl && (
                        <p><strong>Tracking URL:</strong> <Link url={fulfillment.trackingUrl} external>Track Package</Link></p>
                      )}
                      {fulfillment.estimatedDeliveryAt && (
                        <p><strong>Estimated Delivery:</strong> {formatDate(fulfillment.estimatedDeliveryAt)}</p>
                      )}
                    </TextContainer>
                  ) : (
                    <p>No tracking information available.</p>
                  )}
                </Card.Section>
              </Card>
            </Layout.Section>
            
            <Layout.Section>
              <Card title="Fulfilled Items">
                <Card.Section>
                  <List type="bullet">
                    {fulfillment.lineItems.map(item => (
                      <List.Item key={item.id}>
                        {item.quantity} x {item.orderLineItem.title}
                        {item.orderLineItem.variantTitle && ` (${item.orderLineItem.variantTitle})`}
                      </List.Item>
                    ))}
                  </List>
                </Card.Section>
              </Card>
            </Layout.Section>
          </>
        )}
      </Layout>
    </Page>
  );
}
```

### 6. API Client Functions

Create API client functions to interact with the backend:

```typescript
// app/api/fulfillment.ts

export async function getFulfillmentsForOrder(session, orderId) {
  const response = await fetch(`/api/orders/${orderId}/fulfillments`, {
    headers: {
      "Authorization": `Bearer ${session.accessToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch fulfillments");
  }
  
  return response.json();
}

export async function getFulfillmentById(session, fulfillmentId) {
  const response = await fetch(`/api/fulfillments/${fulfillmentId}`, {
    headers: {
      "Authorization": `Bearer ${session.accessToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to fetch fulfillment");
  }
  
  return response.json();
}

export async function createFulfillment(session, fulfillmentData) {
  const response = await fetch(`/api/fulfillments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(fulfillmentData)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create fulfillment");
  }
  
  return response.json();
}

export async function cancelFulfillment(session, fulfillmentId, reason) {
  const response = await fetch(`/api/fulfillments/${fulfillmentId}/cancel`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${session.accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ reason })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to cancel fulfillment");
  }
  
  return response.json();
}
```

## Dependencies & Prerequisites

- Completed Phase 4D-1 through 4D-5
- Remix.js for routing and data fetching
- Shopify Polaris design system
- API integrations for fulfillment operations

## Testing Guidelines

1. **User Interface:**
   - Test all screens in different browsers
   - Verify mobile responsiveness
   - Test with various screen sizes and resolutions

2. **User Flows:**
   - Test complete fulfillment creation workflow
   - Verify validation rules work correctly
   - Test edge cases like zero quantity or no line items

3. **Integration Points:**
   - Verify API requests contain correct data
   - Test error states and recovery
   - Validate success messages and redirects

## Conclusion

With the UI components complete, merchants can now manage the entire fulfillment process from within the Avnu Marketplace. This completes Phase 4 of the Shopify integration, providing a comprehensive order management system that integrates seamlessly with Shopify's platform.
