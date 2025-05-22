#!/bin/bash

# Create an archive directory outside the project structure
ARCHIVE_DIR="/Users/taylorjackson/WooCommerce_Archive_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$ARCHIVE_DIR"

echo "Creating archive directory: $ARCHIVE_DIR"

# Function to copy files to archive and then remove them
archive_and_remove() {
    SOURCE="$1"
    if [ -e "$SOURCE" ]; then
        # Create target directory structure in archive
        TARGET_DIR="$ARCHIVE_DIR/$(dirname "${SOURCE#/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/}")"
        mkdir -p "$TARGET_DIR"
        
        # Copy to archive
        cp -r "$SOURCE" "$TARGET_DIR"
        echo "Archived: $SOURCE"
        
        # Remove original
        rm -rf "$SOURCE"
        echo "Removed: $SOURCE"
    fi
}

# Archive WooCommerce-specific backup files
echo "Archiving WooCommerce-related files and directories..."

# Archive specific backup directories
archive_and_remove "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/archive-backups"
archive_and_remove "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/backups"
archive_and_remove "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/backup-redundant-files"

# Archive compiled backup files in dist
archive_and_remove "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/dist/archive-backups"
archive_and_remove "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/dist/backups"

# Find and archive any remaining WooCommerce files
find "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace" -type f -name "*woocommerce*" | while read file; do
    archive_and_remove "$file"
done

echo "Removing test file for WooCommerce sync service..."
archive_and_remove "/Users/taylorjackson/Desktop/Halle's Game/avnu-marketplace/backend/test/unit/woocommerce-sync.service.spec.ts"

echo ""
echo "Archiving complete. All WooCommerce-related backup files have been moved to:"
echo "$ARCHIVE_DIR"
echo ""
echo "You can now run your tests without interference from backup files."
echo "If you need to reference these files in the future, they are safely stored in the archive directory."
