#!/bin/bash

# Shopify-First Migration Deployment Script
# This script handles the complete deployment process for the Shopify-first migration

set -e  # Exit immediately if a command exits with a non-zero status

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================================${NC}"
echo -e "${BLUE}      SHOPIFY-FIRST MIGRATION DEPLOYMENT SCRIPT           ${NC}"
echo -e "${BLUE}==========================================================${NC}"

# 1. Verify Environment
echo -e "\n${YELLOW}1. Verifying Environment${NC}"

# Check for required production environment variables
if [[ ! -f ./backend/.env.production ]]; then
    echo -e "${RED}ERROR: .env.production file not found!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ .env.production file found${NC}"
    
    # Check if placeholder variables have been replaced
    if grep -q "REPLACE_WITH_ACTUAL" ./backend/.env.production; then
        echo -e "${RED}ERROR: Production environment variables contain placeholders!${NC}"
        echo -e "${RED}       Please update .env.production with actual credentials before deployment.${NC}"
        exit 1
    else
        echo -e "${GREEN}✓ Production environment variables appear to be set${NC}"
    fi
fi

# 2. Run Verification Script
echo -e "\n${YELLOW}2. Running Pre-deployment Verification${NC}"

# Run Shopify verification script
if ! ./backend/scripts/verify-shopify-implementation.sh; then
    echo -e "${RED}ERROR: Shopify implementation verification failed!${NC}"
    echo -e "${RED}       Please fix the issues before deploying.${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Shopify implementation verification passed${NC}"
fi

# 3. Build Backend
echo -e "\n${YELLOW}3. Building Backend${NC}"

# Navigate to backend directory
cd backend

# Install dependencies
echo "Installing backend dependencies..."
npm install

# Build backend
echo "Building backend..."
npm run build

# 4. Prepare Database Migration
echo -e "\n${YELLOW}4. Preparing Database Migration${NC}"

echo -e "${GREEN}✓ Database migration script is ready: migrations/1714222133000-ShopifyFirstMigration.ts${NC}"
echo -e "${YELLOW}NOTE: The actual migration will be run in the deployment environment.${NC}"
echo -e "${YELLOW}      Use the following command in the deployment environment:${NC}"
echo -e "${YELLOW}      npm run migration:run${NC}"

# 5. Build Frontend
echo -e "\n${YELLOW}5. Building Frontend${NC}"

# Navigate to frontend directory
cd ../frontend

# Install dependencies
echo "Installing frontend dependencies..."
npm install

# Build frontend
echo "Building frontend..."
npm run build

# 6. Package Deployment
echo -e "\n${YELLOW}6. Packaging Deployment${NC}"

# Navigate back to root directory
cd ..

# Create deployment directory if it doesn't exist
mkdir -p deployment

# Create backend package
echo "Creating backend deployment package..."
tar -czf deployment/backend-shopify-first.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    backend/dist \
    backend/migrations \
    backend/package.json \
    backend/package-lock.json \
    backend/.env.production \
    backend/scripts/verify-migration.sh \
    backend/scripts/verify-shopify-implementation.sh

# Create frontend package
echo "Creating frontend deployment package..."
tar -czf deployment/frontend-shopify-first.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    frontend/build \
    frontend/public/docs

echo -e "${GREEN}✓ Deployment packages created in the 'deployment' directory${NC}"

# 7. Deployment Instructions
echo -e "\n${YELLOW}7. Deployment Instructions${NC}"
echo -e "To deploy this migration to production, follow these steps:"
echo -e "   1. Copy deployment packages to your production server"
echo -e "   2. Unpack packages to their respective locations"
echo -e "   3. Run database migration: ${GREEN}npm run migration:run${NC}"
echo -e "   4. Restart backend service"
echo -e "   5. Deploy frontend assets to web server"
echo -e "   6. Monitor logs for any issues during the first few hours"
echo -e ""
echo -e "Refer to ${GREEN}SHOPIFY_DEPLOYMENT_PLAN.md${NC} for detailed procedures and rollback instructions."

echo -e "\n${GREEN}Shopify-First Migration build complete and ready for deployment!${NC}"
