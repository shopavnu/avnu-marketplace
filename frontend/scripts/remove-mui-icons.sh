#!/bin/bash

# Script to remove MUI icon imports from all files to fix deployment issues

echo "Starting to remove MUI icon imports from files..."

# Files to process
FILES=(
  "src/pages/admin/analytics/platform-metrics.tsx"
  "src/pages/admin/analytics/search-analytics.tsx"
  "src/pages/admin/analytics/user-behavior.tsx"
  "src/pages/admin/analytics/merchant-performance.tsx"
  "src/pages/admin/analytics/marketplace-health.tsx"
  "src/pages/admin/analytics/revenue-financial.tsx"
  "src/pages/admin/analytics/shopify-integration.tsx"
  "src/pages/admin/analytics/payment-analytics.tsx"
  "src/pages/admin/analytics/cohort-analysis.tsx"
)

# Loop through each file
for file in "${FILES[@]}"; do
  echo "Processing $file..."
  
  # Use sed to replace the import block with a comment
  # This pattern looks for imports from '@mui/icons-material' including multi-line imports
  sed -i '' -E '
    /import[[:space:]]*{/,/}[[:space:]]*from[[:space:]]*'\''@mui\/icons-material'\'';/ {
      /import[[:space:]]*{/ {
        s/import[[:space:]]*{/\/\/ Removed MUI icon imports to fix deployment issues/
        h
        d
      }
      /}[[:space:]]*from[[:space:]]*'\''@mui\/icons-material'\'';/ {
        x
        p
        d
      }
      d
    }
  ' $file
  
  echo "Finished processing $file"
done

echo "All files processed. MUI icon imports have been removed."
