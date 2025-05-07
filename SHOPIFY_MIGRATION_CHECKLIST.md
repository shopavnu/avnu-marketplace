# Shopify-First Migration Checklist

## Overview

This document provides a comprehensive guide for completing the Shopify-first migration, including preparation, testing, deployment, and verification steps. This checklist is designed to ensure a smooth transition from a multi-platform approach to a Shopify-only integration.

## Prerequisites

- [ ] Shopify Partner account created
- [ ] Shopify App created in the Shopify Partner Dashboard
- [ ] App API credentials obtained (API Key, API Secret)
- [ ] Appropriate app scopes configured
- [ ] Webhook endpoints configured in the Shopify Partner Dashboard
- [ ] Webhook secret key generated

## Pre-Deployment Tasks

### 1. Code Preparation

- [ ] Complete all TypeScript error fixes:
  - [ ] Fix `BulkImportService` result tracking
  - [ ] Fix `ShopifySyncService` property access (replace `lastSyncCompleted` with `lastSyncedAt`)
  - [ ] Update `MerchantPlatformConnection` references
  - [ ] Standardize connection object properties (use `isActive` instead of `active`)
  - [ ] Address decorator issues in `shopify-app.service.ts`
  - [ ] Fix Check decorator issue in `order-item.entity.ts`

- [ ] Clean up WooCommerce references:
  - [ ] Ensure `IntegrationType` enum only includes SHOPIFY
  - [ ] Remove WooCommerce-related imports and dependencies
  - [ ] Update test files to reference only Shopify

### 2. Environment Configuration

- [ ] Update the `.env.production` file with actual values:
  ```
  # Shopify Integration Settings
  SHOPIFY_API_KEY=<your_actual_api_key>
  SHOPIFY_API_SECRET_KEY=<your_actual_api_secret>
  SHOPIFY_API_VERSION=2023-07
  SHOPIFY_SCOPES=read_products,write_products,read_orders,write_orders,read_inventory,read_customers
  SHOPIFY_WEBHOOK_SECRET=<your_actual_webhook_secret>
  HOST_NAME=api.avnu-marketplace.com
  SHOPIFY_MAX_RETRIES=5
  SHOPIFY_RETRY_DELAY=2000
  
  # Database Configuration
  DB_HOST=<production_db_host>
  DB_PORT=5432
  DB_USERNAME=<production_db_user>
  DB_PASSWORD=<production_db_password>
  DB_DATABASE=<production_db_name>
  ```

### 3. Testing

- [ ] Run linting checks: `npm run lint`
- [ ] Run unit tests: `npm run test`
- [ ] Run integration tests: `npm run test:integration`
- [ ] Run E2E tests: `npm run test:e2e`
- [ ] Manually test Shopify integration in development environment
- [ ] Verify webhook handling functionality

### 4. Database Preparation

- [ ] Create a complete database backup
- [ ] Verify the migration script content is correct:
  ```
  migrations/1714222133000-ShopifyFirstMigration.ts
  ```
- [ ] Test the migration in a development environment

## Deployment Process

### 1. Staging Deployment

- [ ] Create deployment packages:
  ```bash
  ./deploy-shopify-migration.sh
  ```
- [ ] Deploy packages to staging environment
- [ ] Run database migration in staging:
  ```bash
  npm run migration:run
  ```
- [ ] Restart backend services
- [ ] Deploy frontend assets
- [ ] Verify all functionality in staging

### 2. Production Deployment

- [ ] Schedule maintenance window
- [ ] Notify users of planned downtime (if applicable)
- [ ] Create a final database backup
- [ ] Deploy packages to production environment
- [ ] Run database migration:
  ```bash
  npm run migration:run
  ```
- [ ] Restart backend services
- [ ] Deploy frontend assets

## Post-Deployment Verification

- [ ] Verify Shopify API connection
- [ ] Test product synchronization
- [ ] Test order synchronization
- [ ] Verify webhook reception and handling
- [ ] Check database integrity
- [ ] Monitor logs for any errors
- [ ] Perform user acceptance testing

## Rollback Plan

If critical issues are encountered during or after deployment:

1. **Database Issues**
   - [ ] Stop affected services
   - [ ] Restore database from backup
   - [ ] Restart services
   - [ ] Verify system functionality

2. **Code Issues**
   - [ ] Revert to previous code version
   - [ ] Redeploy affected services
   - [ ] Verify system functionality

3. **Integration Issues**
   - [ ] Check Shopify API credentials and scopes
   - [ ] Verify webhook configuration
   - [ ] Review API request/response logs
   - [ ] Test connection with Shopify API using a tool like Postman

## Additional Notes

- The migration script backs up WooCommerce connections before removing them, allowing for potential recovery if needed
- When connecting to the Shopify API, ensure your server's IP address is whitelisted if applicable
- Keep the backup database files for at least 30 days after successful migration
- Document any issues encountered during migration for future reference
