# Product Suppression & Merchant Notification System

## Overview

The Product Suppression & Merchant Notification System ensures that only high-quality product listings are displayed to customers in the Avnu Marketplace. It automatically validates product data, suppresses products with missing key information, and notifies merchants via email so they can fix issues.

## Key Features

1. **Automated Product Validation**
   - Validates all products for required data fields
   - Runs on scheduled intervals (daily full validation, hourly for new imports)
   - Validates products when they're created or updated

2. **Intelligent Suppression**
   - Suppresses products from specific areas based on what data is missing
   - Maintains product visibility in merchant dashboards
   - Provides clear indication of suppression status to merchants

3. **Merchant Notifications**
   - Sends email notifications to merchants about suppressed products
   - Includes detailed information about what issues need to be fixed
   - Provides direct links to edit the affected products

4. **Frontend Integration**
   - Filters suppressed products from recommendation components
   - Shows suppression overlay for merchants viewing their own products
   - Maintains consistent product counts in recommendation sections

## Technical Implementation

### Backend Components

#### 1. Product Validation Service

The `ProductValidationService` is responsible for validating products and updating their suppression status:

```typescript
// Key validation logic
async validateProduct(product: Product): Promise<{
  isValid: boolean;
  issues: string[];
  suppressedFrom: string[];
}> {
  const issues: string[] = [];
  const suppressedFrom: string[] = [];

  // Check for missing images
  if (!product.images || product.images.length === 0) {
    issues.push('Missing product images');
    suppressedFrom.push('search results');
    suppressedFrom.push('product recommendations');
  }

  // Check for missing title
  if (!product.title || product.title.trim() === '') {
    issues.push('Missing product title');
    suppressedFrom.push('search results');
    suppressedFrom.push('product recommendations');
    suppressedFrom.push('category pages');
  }

  // Additional validation checks...

  // Update product suppression status
  if (suppressedFrom.length > 0) {
    await this.updateProductSuppressionStatus(product.id, true, suppressedFrom);
  } else if (product.isSuppressed) {
    await this.updateProductSuppressionStatus(product.id, false, []);
  }

  return {
    isValid: issues.length === 0,
    issues,
    suppressedFrom,
  };
}
```

#### 2. Scheduled Validation Tasks

The `ProductValidationTask` runs scheduled validations:

```typescript
// Daily full validation
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async validateAllProducts(): Promise<void> {
  this.logger.log('Starting daily product validation task');
  await this.productValidationService.validateAllProducts();
}

// Hourly validation for new imports
@Cron(CronExpression.EVERY_HOUR)
async validateRecentProducts(): Promise<void> {
  this.logger.log('Starting hourly validation for recently imported products');
  // Validate products imported in the last hour
}
```

#### 3. Notification Service

The `NotificationService` sends emails to merchants:

```typescript
async notifyMerchantOfProductIssues(
  merchantId: string,
  merchantEmail: string,
  productIssues: Array<{
    productId: string;
    productTitle: string;
    issues: string[];
    suppressedFrom: string[];
  }>,
): Promise<boolean> {
  // Send email notification with detailed information about issues
}
```

#### 4. Event-Driven Architecture

The system uses events to decouple validation from notification:

```typescript
// When validation finds issues
this.eventEmitter.emit('merchant.product.issues', {
  merchantId,
  merchantEmail: merchant.email,
  productIssues,
});

// Event listener
@OnEvent('merchant.product.issues')
async handleProductIssuesEvent(payload: ProductIssueEvent): Promise<void> {
  // Send notification to merchant
}
```

### Frontend Components

#### 1. Product Card Components

The `ResponsiveProductCard` component shows suppression information to merchants:

```tsx
// Suppression overlay (only visible to merchants)
{isProductSuppressed && isMerchantView && (
  <div className="suppression-overlay">
    <div className="suppression-badge">Product Suppressed</div>
    <p>This product is not visible to customers due to missing or invalid data.</p>
    {suppressionReasons.length > 0 && (
      <div>
        <p>Suppressed from:</p>
        <ul>
          {suppressionReasons.map((reason, index) => (
            <li key={index}>{reason}</li>
          ))}
        </ul>
      </div>
    )}
    <button onClick={handleFixIssues}>Fix Issues</button>
  </div>
)}
```

#### 2. Recommendation Components

All recommendation components filter out suppressed products:

```tsx
// Filter out suppressed products
const filteredProducts = products.filter(product => !product.isSuppressed);

// If we need more products to reach the limit after filtering, fetch additional ones
if (filteredProducts.length < limit) {
  const additionalCount = limit - filteredProducts.length;
  const additionalProducts = await fetchMoreProducts(additionalCount + 5);
  
  // Filter and add additional products
  // ...
}
```

## Database Schema

### Product Entity

The Product entity includes suppression fields:

```typescript
@Entity('products')
export class Product {
  // ... other fields

  @Column({ default: false })
  isSuppressed: boolean;

  @Column('simple-array', { nullable: true })
  suppressedFrom?: string[];

  @Column({ nullable: true })
  lastValidationDate?: Date;
}
```

### Merchant Entity

The Merchant entity includes an email field for notifications:

```typescript
@Entity('merchants')
export class Merchant {
  // ... other fields

  @Column()
  email: string;
}
```

## Configuration

### Email Configuration

Email notifications require the following environment variables:

```
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=notifications@avnu-marketplace.com
EMAIL_PASSWORD=your-secure-password
EMAIL_FROM=notifications@avnu-marketplace.com
```

### Validation Schedule

Validation schedules can be adjusted in the `ProductValidationTask` class:

```typescript
// Default: Run daily at midnight
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)

// Default: Run hourly for new imports
@Cron(CronExpression.EVERY_HOUR)
```

## Usage Examples

### Merchant Dashboard Integration

The merchant dashboard should display suppressed products with a clear indication of issues:

```tsx
<ProductList
  products={merchantProducts}
  isMerchantView={true}
  renderActions={(product) => (
    <>
      {product.isSuppressed && (
        <Button 
          variant="warning"
          onClick={() => navigate(`/merchant/products/edit/${product.id}`)}
        >
          Fix Issues
        </Button>
      )}
      {/* Other actions */}
    </>
  )}
/>
```

### Validation Trigger on Import

Trigger validation when products are imported:

```typescript
@Post('/products/import')
async importProducts(@Body() importData: ProductImportDto) {
  const importedProducts = await this.productImportService.importProducts(importData);
  
  // Validate imported products
  for (const product of importedProducts) {
    await this.productValidationService.validateProduct(product);
  }
  
  return { success: true, count: importedProducts.length };
}
```

## Troubleshooting

### Common Issues

1. **Missing Merchant Email**
   - Ensure all merchants have a valid email address
   - Check the migration that adds the email field to existing merchants

2. **Email Delivery Issues**
   - Verify SMTP settings in environment variables
   - Check email service logs for delivery failures

3. **Excessive Suppression**
   - Review validation criteria if too many products are being suppressed
   - Consider adjusting validation rules for specific merchant categories

### Monitoring

Monitor the following metrics:

- Number of suppressed products per merchant
- Email delivery success rate
- Product validation performance (execution time)
- Merchant response time to fix suppressed products

## Future Enhancements

1. **Merchant Portal Notifications**
   - Add in-app notifications in addition to email

2. **Validation Rule Configuration**
   - Allow per-merchant or per-category validation rules

3. **Auto-Correction**
   - Implement AI-based auto-correction for common issues

4. **Validation API**
   - Expose validation API for merchants to check products before import

5. **Suppression Analytics**
   - Provide analytics on suppression reasons and fix rates
