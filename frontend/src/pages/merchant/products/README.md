# Merchant Dashboard for Suppressed Products

## Overview

The Merchant Dashboard for Suppressed Products provides a dedicated interface for merchants to view, filter, and manage products that have been automatically suppressed due to missing or invalid data. This dashboard helps merchants quickly identify and fix data quality issues to ensure their products are visible to customers across the marketplace.

## Key Features

- **Comprehensive Product List**: View all suppressed products with detailed information about suppression reasons
- **Filtering System**: Filter products by issue type (missing images, title, price, etc.)
- **Expandable Details**: Click to expand each product for more detailed information
- **Bulk Selection**: Select multiple products for batch actions
- **Revalidation**: Instantly revalidate products after fixing issues
- **Integration**: Seamlessly integrated with the main merchant dashboard

## Components

### 1. Suppressed Products Page

Located at `/merchant/products/suppressed.tsx`, this is the main page for viewing and managing suppressed products.

Key functionality:
- Fetches suppressed products from the API
- Provides filtering by issue type
- Displays product details with expandable sections
- Supports product selection for bulk actions
- Integrates with the SuppressedProductsBulkActions component

### 2. Bulk Actions Component

Located at `/components/merchant/SuppressedProductsBulkActions.tsx`, this component provides a floating action bar for performing operations on multiple selected products.

Key functionality:
- Displays the number of selected products
- Provides bulk revalidation functionality
- Offers bulk edit capability
- Shows action results with success/error feedback

## API Integration

The dashboard integrates with the backend through:

- `ProductService.getSuppressedProducts()`: Fetches all suppressed products for a merchant
- `MerchantProductsController.getSuppressedProducts()`: Backend endpoint that returns suppressed products

## User Flow

1. Merchant accesses the dashboard via:
   - Direct URL: `/merchant/products/suppressed`
   - Link from main dashboard: "Suppressed Products" card

2. Merchant views suppressed products with issue indicators
   - Each product shows specific issues (missing images, title, price, etc.)
   - Products can be expanded to show more details

3. Merchant can filter products by issue type
   - Filter dropdown allows focusing on specific issues

4. Merchant selects products for bulk actions
   - Individual checkboxes or "Select All" option
   - Bulk action bar appears when products are selected

5. Merchant takes action on products
   - Revalidate: Check if issues have been fixed
   - Edit: Navigate to product edit page
   - Bulk Edit: Make changes to multiple products at once

## Design Considerations

- **Visibility**: Clear indicators for suppression reasons with color-coding
- **Efficiency**: Bulk actions to handle multiple products at once
- **Guidance**: Detailed information about what needs to be fixed
- **Integration**: Consistent design with the rest of the merchant portal
- **Responsiveness**: Works well on all device sizes

## Technical Implementation

### Frontend

- React functional components with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Responsive design for all device sizes

### Backend

- NestJS controllers and services
- TypeORM for database interactions
- Repository pattern for data access
- Proper error handling and validation

## Future Enhancements

- **Automated Fix Suggestions**: AI-powered suggestions for fixing common issues
- **Bulk Edit Interface**: Direct editing of multiple products in a single interface
- **Issue Trends**: Analytics on common suppression reasons over time
- **Scheduled Revalidation**: Set automatic revalidation for products after edits
- **Export Functionality**: Export list of suppressed products for offline processing

## Related Documentation

- [Product Suppression & Merchant Notification](/docs/PRODUCT_SUPPRESSION.md)
- [Product Validation Service](/backend/src/modules/products/services/README.md)
- [TypeScript Issues Documentation](/TYPESCRIPT-ISSUES.md)
