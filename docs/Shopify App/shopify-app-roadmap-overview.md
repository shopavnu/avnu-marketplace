# Avnu Marketplace Shopify Integration Roadmap

## Overview & Purpose

This document provides a comprehensive guide for developing the Avnu Marketplace Shopify integration app. It details the technical architecture, implementation phases, and code requirements for each component of the system.

**Business Objectives:**
- Enable merchants to onboard to Avnu Marketplace via Shopify
- Synchronize product data between Shopify and Avnu
- Process orders placed on Avnu in the merchant's Shopify store
- Provide a seamless brand setup experience within Shopify Admin

**Related Documents:**
- [Phase 1: Core Infrastructure](./shopify-app-phase1-infrastructure.md)
- [Phase 2: Onboarding UI](./shopify-app-phase2-onboarding.md)
- [Phase 3: Synchronization Engine](./shopify-app-phase3-sync.md)
- [Phase 4: Order Management](./shopify-app-phase4-orders.md)
- [Phase 5: Admin Portal & Analytics](./shopify-app-phase5-admin.md)
- [Phase 6: Testing & Launch](./shopify-app-phase6-testing.md)
- [API Reference & Data Models](./shopify-app-api-reference.md)

## Architecture Overview

| Component | Technology | Description |
|-----------|------------|-------------|
| **Backend API** | NestJS | Existing Avnu backend with enhanced Shopify services |
| **Embedded UI** | Remix + Polaris + App Bridge | Shopify-embedded merchant onboarding experience |
| **API Layer** | GraphQL (Admin API) | Primary interface with Shopify store data |
| **Data Storage** | PostgreSQL + TypeORM | Extended from current Avnu database schema |
| **Background Processing** | Bull + Redis | Async handling of sync operations |
| **Webhooks** | NestJS Controllers | Real-time data sync from Shopify to Avnu |

## System Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Shopify Admin  │◄────┤  Embedded App   │◄────┤  Avnu Backend   │
│                 │     │  (Remix)        │     │  (NestJS)       │
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                               │
         │                                               │
         ▼                                               ▼
┌─────────────────┐                            ┌─────────────────┐
│                 │                            │                 │
│  Shopify APIs   │◄───────────────────────────┤ Avnu Database   │
│  (Admin GraphQL)│                            │ (PostgreSQL)    │
└────────┬────────┘                            └─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│                 │
│    Webhooks     │───────────────────────────►┌─────────────────┐
│                 │                            │                 │
└─────────────────┘                            │  Background     │
                                               │  Jobs (Bull)    │
                                               │                 │
                                               └─────────────────┘
```

## Implementation Timeline

| Phase | Timeline | Components | Dependencies |
|-------|----------|------------|--------------|
| **1. Core Infrastructure** | Weeks 1-2 | OAuth, App Setup, Database Extensions | Shopify Partner Account |
| **2. Onboarding UI** | Weeks 3-5 | Brand Setup, Product Selection, Shipping Config | Phase 1 |
| **3. Synchronization Engine** | Weeks 6-8 | Product Sync, Webhooks, Background Jobs | Phase 1, 2 |
| **4. Order Management** | Weeks 9-10 | Order Creation, Fulfillment Tracking | Phase 3 |
| **5. Admin Portal & Analytics** | Week 11 | Merchant Approval, Dashboards | Phase 1-4 |
| **6. Testing & Launch** | Week 12 | End-to-end Testing, Security Review | All Phases |

## Key Shopify Concepts

### OAuth Scopes Required

```
read_products, read_product_listings, read_inventory,
write_orders, read_orders, read_merchant_managed_fulfillment_orders,
read_shipping, read_files, write_files, read_fulfillments, 
read_shipping_rates, read_metafields, write_metafields
```

### Webhook Topics to Monitor

```
PRODUCTS_CREATE, PRODUCTS_UPDATE, PRODUCTS_DELETE
PRODUCT_VARIANTS_CREATE, PRODUCT_VARIANTS_UPDATE
INVENTORY_LEVELS_UPDATE
ORDERS_FULFILLED, FULFILLMENTS_CREATE, FULFILLMENTS_UPDATE
APP_UNINSTALLED
```

## Getting Started

1. Create a Shopify Partner account at [partners.shopify.com](https://partners.shopify.com)
2. Create a development store for testing
3. Register a new app in the Partner Dashboard
4. Configure the app with the required scopes and callback URLs
5. Begin implementation of Phase 1 components

For more detailed instructions on each phase, refer to the corresponding phase document.
