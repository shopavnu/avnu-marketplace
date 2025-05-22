#!/bin/bash

# Create an archive directory outside the project structure
ARCHIVE_DIR="/Users/taylorjackson/WooCommerce_Archive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "Creating archive directory: $ARCHIVE_DIR"

# Move backup directories to archive
echo "Moving backup directories to archive..."
mv "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/archive-backups" "$ARCHIVE_DIR/" 2>/dev/null
mv "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/backups" "$ARCHIVE_DIR/" 2>/dev/null 
mv "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/backup-redundant-files" "$ARCHIVE_DIR/" 2>/dev/null
mv "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/dist/archive-backups" "$ARCHIVE_DIR/" 2>/dev/null
mv "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/dist/backups" "$ARCHIVE_DIR/" 2>/dev/null

# Remove the WooCommerce test file
echo "Removing WooCommerce test file..."
rm -f "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/test/unit/woocommerce-sync.service.spec.ts" 2>/dev/null

echo ""
echo "Cleanup complete. All WooCommerce-related backup files have been moved to:"
echo "$ARCHIVE_DIR"
echo ""
echo "You can now run your tests without interference from backup files."
echo "If you need to reference these files in the future, they are safely stored in the archive directory."
