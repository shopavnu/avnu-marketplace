#!/bin/bash

# Script to commit and push changes to the feature branch

# Set variables
BRANCH="feature/vertical-discovery-card-consistency"
COMMIT_MSG=$(cat COMMIT-MESSAGE.md)

# Make sure we're on the right branch
git checkout $BRANCH

# Add all the new files
git add backend/src/modules/categories/
git add backend/src/modules/products/resolvers/
git add backend/src/modules/products/services/product-suppression-analytics.service.ts
git add backend/src/modules/products/services/product-cache.service.ts
git add backend/src/modules/products/services/cached-products.service.ts
git add backend/src/modules/products/services/cache-warming.service.ts
git add backend/src/modules/products/services/cache-performance-monitor.service.ts
git add backend/src/modules/products/controllers/product-cache.controller.ts
git add backend/src/modules/products/resolvers/cached-products.resolver.ts
git add backend/src/modules/products/resolvers/cache-performance.resolver.ts
git add frontend/src/components/admin/AnalyticsNav.tsx
git add frontend/src/components/products/VerticalConsistentProductCard.tsx
git add frontend/src/pages/admin/analytics/suppression-metrics.tsx
git add frontend/src/components/layout/Header.tsx
git add backend/.env.redis.example
git add backend/REDIS-CACHING.md
git add backend/PERFORMANCE-OPTIMIZATION.md
git add ADMIN-ANALYTICS.md
git add PULL_REQUEST.md

# Add modified files
git add backend/src/app.module.ts
git add backend/src/modules/products/products.module.ts
git add backend/src/modules/merchants/resolvers/ad-budget-management.resolver.ts
git add backend/src/scripts/test-analytics-services.ts
git add backend/src/utils/decorator-compatibility.ts
git add backend/src/modules/personalization/services/session.service.ts
git add backend/src/modules/recommendations/services/personalized-ranking.service.ts
git add backend/src/modules/recommendations/services/recommendation-experiment.service.ts

# Commit the changes
git commit -m "feat(admin): Add suppression analytics, Redis caching, and fix vertical card consistency"

# Push to the remote repository
git push origin $BRANCH

echo "Changes committed and pushed to $BRANCH"
echo "Ready to create a pull request to merge into main"
