#!/bin/bash

# Complete WooCommerce Cleanup Script
# This script runs both backend and frontend cleanup tools
# to ensure a comprehensive cleanup for the Shopify-first approach

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${BLUE}${BOLD}=========================================================${NC}"
echo -e "${BLUE}${BOLD}      AVNU MARKETPLACE - SHOPIFY-FIRST CLEANUP          ${NC}"
echo -e "${BLUE}${BOLD}=========================================================${NC}"
echo ""

# Store current directory
SCRIPT_DIR="$(pwd)"

echo -e "${YELLOW}This script will run a comprehensive cleanup of WooCommerce references${NC}"
echo -e "${YELLOW}across both backend and frontend codebases.${NC}"
echo ""
echo -e "${YELLOW}The process will:${NC}"
echo "  1. Create backups of all modified files"
echo "  2. Clean up backend references to WooCommerce"
echo "  3. Clean up frontend references to WooCommerce"
echo "  4. Generate a comprehensive report"
echo ""
echo -e "${RED}Warning: This script will modify your codebase. Backups will be created.${NC}"
read -p "Do you want to continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Operation cancelled by user.${NC}"
    exit 0
fi

# Create timestamp for this run
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FINAL_REPORT="report-shopify-migration-${TIMESTAMP}.md"

echo -e "${BLUE}${BOLD}Step 1: Running Backend Cleanup Tool${NC}"
echo "======================================="
cd "$SCRIPT_DIR/backend" || exit 1
./scripts/cleanup-woocommerce-references.sh

echo ""
echo -e "${BLUE}${BOLD}Step 2: Running Frontend Cleanup Tool${NC}"
echo "======================================="
cd "$SCRIPT_DIR/frontend" || exit 1
./scripts/cleanup-woocommerce-frontend.sh

echo ""
echo -e "${BLUE}${BOLD}Step 3: Generating Final Report${NC}"
echo "======================================="
cd "$SCRIPT_DIR" || exit 1

# Initialize the final report
echo "# Shopify-First Migration Report" > "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "**Generated:** $(date)" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "## Summary" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Count remaining references
BACKEND_REFS=$(grep -r -l "woocommerce" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir="backups" --exclude-dir="dist" backend/ 2>/dev/null | wc -l)
FRONTEND_REFS=$(grep -r -l "woocommerce" --include="*.ts" --include="*.tsx" --exclude-dir="node_modules" --exclude-dir="backups" --exclude-dir=".next" frontend/ 2>/dev/null | wc -l)
TOTAL_REFS=$((BACKEND_REFS + FRONTEND_REFS))

echo "- **Backend WooCommerce References:** $BACKEND_REFS" >> "$FINAL_REPORT"
echo "- **Frontend WooCommerce References:** $FRONTEND_REFS" >> "$FINAL_REPORT"
echo "- **Total Remaining References:** $TOTAL_REFS" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

# Add section about what was modified
echo "## Modified Files" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "Backup directories were created with the following timestamps:" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
ls -1d backups/*woocommerce* 2>/dev/null | while read -r dir; do
    echo "- $dir" >> "$FINAL_REPORT"
done
echo "" >> "$FINAL_REPORT"

# Add section about next steps
echo "## Next Steps" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"
echo "1. Review the detailed reports in the 'reports' directory" >> "$FINAL_REPORT"
echo "2. Manually inspect any remaining references" >> "$FINAL_REPORT"
echo "3. Run the application tests to ensure functionality" >> "$FINAL_REPORT"
echo "4. Verify the application builds correctly" >> "$FINAL_REPORT"
echo "5. Deploy to staging for further testing" >> "$FINAL_REPORT"
echo "" >> "$FINAL_REPORT"

if [ $TOTAL_REFS -eq 0 ]; then
    echo -e "${GREEN}${BOLD}Success! No WooCommerce references remain in the codebase.${NC}"
    echo "## Status: COMPLETED ✅" >> "$FINAL_REPORT"
    echo "" >> "$FINAL_REPORT"
    echo "The migration to a Shopify-first approach has been completed successfully." >> "$FINAL_REPORT"
else
    echo -e "${YELLOW}${BOLD}Warning: $TOTAL_REFS WooCommerce references still remain in the codebase.${NC}"
    echo -e "${YELLOW}Please check the reports directory for details.${NC}"
    echo "## Status: NEEDS ATTENTION ⚠️" >> "$FINAL_REPORT"
    echo "" >> "$FINAL_REPORT"
    echo "There are still $TOTAL_REFS WooCommerce references that need to be addressed." >> "$FINAL_REPORT"
    echo "Please review the detailed reports in the 'reports' directory for more information." >> "$FINAL_REPORT"
fi

echo ""
echo -e "${BLUE}${BOLD}=========================================================${NC}"
echo -e "${BLUE}${BOLD}                CLEANUP PROCESS COMPLETE                ${NC}"
echo -e "${BLUE}${BOLD}=========================================================${NC}"
echo ""
echo "A final report has been generated at: $FINAL_REPORT"
echo ""
echo -e "${YELLOW}Next recommended steps:${NC}"
echo "1. Run tests: cd backend && npm test"
echo "2. Build backend: cd backend && npm run build"
echo "3. Build frontend: cd frontend && npm run build"
echo "4. Verify database migration: cd backend && npm run migration:run"
echo ""
echo -e "${GREEN}${BOLD}Shopify-first implementation is now ready for final verification!${NC}"
