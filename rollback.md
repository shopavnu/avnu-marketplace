# Prisma Migration Rollback Playbook

If a newly deployed migration causes issues in production, follow these steps to roll it back safely.

1. **Identify the failing migration**
   ```bash
   npx prisma migrate status
   ```
   The last entry with status `Pending` (or `Failed`) is usually the culprit. Note its name, e.g. `20250621155015_shopify_first`.

2. **Mark the migration as rolled back** (in the database _only_). This prevents Prisma from trying to re-apply it on the next deploy.
   ```bash
   npx prisma migrate resolve --rolled-back "20250621155015_shopify_first"
   ```

3. **Restore the previous database state**
   • Prefer restoring from the latest S3 backup created via `make db-backup`.
   ```bash
   make db-restore FILE=s3://$S3_BACKUP_BUCKET/<backup>.sql.gz
   ```
   • Alternatively, craft manual SQL to undo critical changes if a full restore is not viable.

4. **Ship a hot-fix migration** (optional)
   After fixing the schema or data issue locally, generate a new migration and redeploy:
   ```bash
   npx prisma migrate dev --name hotfix_<issue>
   git commit -am "fix(schema): hot-fix migration for <issue>"
   git push
   ```

5. **Re-deploy application**
   CI/CD will run `prisma migrate deploy`, skipping the rolled-back migration and applying the new hot-fix if present.

---
**Important:** `migrate resolve` only affects the `_prisma_migrations` table metadata. It does not undo SQL changes; that’s why the backup/restore step is critical.
