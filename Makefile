# Database backup and restore helpers for Avnu Marketplace backend

# Requires environment variables:
#   DATABASE_URL        e.g. postgres://user:pass@host:5432/dbname
#   S3_BACKUP_BUCKET    e.g. avnu-db-backups
#   AWS credentials     (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_REGION)
#
# Usage:
#   make db-backup                # upload compressed pg_dump to S3
#   make db-restore FILE=s3://bucket/2025-06-21_10-00.sql.gz  # restore from given file

.PHONY: db-backup db-restore

TIMESTAMP := $(shell date +%F_%H-%M)

# Create a gzip-compressed dump and stream directly to S3.
db-backup:
	@echo "Backing up database to s3://$(S3_BACKUP_BUCKET)/$(TIMESTAMP).sql.gz"
	pg_dump --no-owner --dbname="$(DATABASE_URL)" \
		| gzip \
		| aws s3 cp - "s3://$(S3_BACKUP_BUCKET)/$(TIMESTAMP).sql.gz"

# Restore from FILE=<path>. Accepts local path or s3 URI.
db-restore:
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make db-restore FILE=<s3://bucket/backup.sql.gz | /path/backup.sql.gz>"; \
		exit 1; \
	fi
	@echo "Restoring database from $(FILE)"
	@if echo $(FILE) | grep -q '^s3://'; then \
		aws s3 cp $(FILE) - | gunzip | psql "$(DATABASE_URL)"; \
	else \
		gunzip -c $(FILE) | psql "$(DATABASE_URL)"; \
	fi
