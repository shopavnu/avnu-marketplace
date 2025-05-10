# Shopify-First Integration Deployment Guide

This guide outlines the steps for deploying the Shopify-first integration to staging and production environments.

## Pre-Deployment Checklist

- [ ] Run the test suite: `./backend/scripts/test-shopify-integration.sh`
- [ ] Ensure all TypeScript errors are resolved: `npm run tsc --project backend/tsconfig.json`
- [ ] Check for any remaining WooCommerce references in the codebase: `grep -r "woocommerce" --include="*.ts" --include="*.tsx" .`
- [ ] Update the frontend build: `cd frontend && npm run build`

## Deployment to Staging

1. **Backup the Database**
   ```bash
   # Connect to your staging database and create a backup
   pg_dump -U username -h hostname -d avnu_staging > avnu_staging_backup_$(date +%Y%m%d).sql
   ```

2. **Deploy Backend Changes**
   ```bash
   # From your CI/CD pipeline or manually
   cd backend
   npm ci
   npm run build
   # Deploy using your preferred method (e.g., Docker, PM2, etc.)
   ```

3. **Deploy Frontend Changes**
   ```bash
   cd frontend
   npm ci
   npm run build
   # Deploy using your preferred method
   ```

4. **Run Database Migrations**
   ```bash
   cd backend
   npm run migration:run
   ```

5. **Verify Shopify Integration**
   - Connect a test Shopify store
   - Import products
   - Verify webhook functionality
   - Test order synchronization

## Production Deployment

Only proceed after successful staging deployment and thorough testing.

1. **Schedule Maintenance Window**
   - Notify users of the scheduled maintenance
   - Choose a low-traffic time window

2. **Backup Production Database**
   ```bash
   pg_dump -U username -h hostname -d avnu_production > avnu_production_backup_$(date +%Y%m%d).sql
   ```

3. **Deploy to Production**
   - Follow the same steps as staging deployment
   - Monitor logs carefully during the deployment

4. **Verify Production Functionality**
   - Test with a real merchant Shopify connection
   - Verify product import/export
   - Check webhook reception
   - Ensure order synchronization works

## Rollback Plan

If issues are encountered during deployment:

1. **Restore Database Backup**
   ```bash
   psql -U username -h hostname -d avnu_production < avnu_production_backup_$(date +%Y%m%d).sql
   ```

2. **Rollback Code**
   - Revert to the previous version of the application
   - Deploy the previous version following the same deployment process

3. **Notify Team**
   - Document the issues encountered
   - Schedule a post-mortem meeting to address the issues

## Post-Deployment Monitoring

1. **Watch Error Logs**
   - Monitor application logs for any unexpected errors
   - Check for Shopify API rate limiting issues

2. **Monitor Performance**
   - Watch database query performance
   - Monitor API response times
   - Check webhook processing times

3. **User Feedback**
   - Collect and respond to user feedback
   - Address any issues reported by merchants

## Documentation Updates

After successful deployment, ensure the following documentation is updated:

- API documentation
- Integration guides for merchants
- Internal development documentation
- Knowledge base articles for customer support

## Contact Information

For deployment issues, contact:

- Backend Team: backend@avnu.com
- Frontend Team: frontend@avnu.com
- DevOps: devops@avnu.com
