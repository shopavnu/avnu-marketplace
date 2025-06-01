# Environment Variables Management

This document provides guidelines for managing environment variables across different environments in the Avnu Marketplace platform.

## Overview

The Avnu Marketplace application uses environment variables for configuration across frontend, backend, and worker services. Proper management of these variables is crucial for:

- Security (keeping sensitive data out of version control)
- Environment-specific configuration
- Containerization and deployment
- Local development

## Environment Files

The following environment files are used in the project:

- `.env.example` - Template with all available variables (committed to git)
- `.env.local` - Local development overrides (not committed to git)
- `.env.test` - Testing environment variables (committed to git)
- `.env.production` - Production defaults (not committed to git)

## Setting Up Environment Variables

### Local Development

1. Copy the template file to create your local environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Modify values in `.env.local` as needed for your local setup

3. For Docker Compose development:
   ```bash
   docker compose --env-file .env.local up
   ```

### CI/CD Pipeline

In GitHub Actions workflows, set sensitive environment variables as GitHub Secrets:

1. Go to your repository Settings → Secrets and Variables → Actions
2. Add each sensitive variable (e.g., `CLERK_SECRET_KEY`, `DATABASE_URL`)
3. Reference them in workflows using `${{ secrets.VARIABLE_NAME }}`

### Production Deployment

For Render deployment:

1. Set environment variables in the Render dashboard for each service
2. Mark sensitive variables with `sync: false` in `render.yaml`
3. Use environment-specific services (e.g., production database)

## Key Variable Categories

### Critical Security Variables

These should NEVER be committed to git and should be stored securely:

- `CLERK_SECRET_KEY`
- `DATABASE_URL` (with credentials)
- `ELASTICSEARCH_PASSWORD`
- Any API keys or tokens

### Public Variables

These are safe to commit to git and are needed by the frontend:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_API_URL`

### Service Connection Variables

These define how services connect to each other:

- `DB_HOST`, `DB_PORT`, etc.
- `REDIS_HOST`, `REDIS_PORT`
- `ELASTICSEARCH_NODE`

## Docker-Specific Variables

For Docker deployments, the following variables control which Dockerfiles are used:

- `DOCKERFILE_FRONTEND` - Which Dockerfile to use for the web service
- `DOCKERFILE_BACKEND` - Which Dockerfile to use for the API service  
- `DOCKERFILE_WORKER` - Which Dockerfile to use for the worker service

Set these to `Dockerfile` (without .dev) for production builds.

## Best Practices

1. **Never hardcode sensitive information** in your application code
2. **Keep .env files out of version control** (except for .env.example)
3. **Use specific variable names** to avoid confusion
4. **Document all variables** in the .env.example file
5. **Use different variables for different environments**
6. **Regularly rotate sensitive credentials**

## Troubleshooting

If environment variables aren't being picked up:

1. Check that the variable is properly defined in your environment file
2. Verify that the file is being loaded (check Docker Compose configuration)
3. Restart services after changing environment variables
4. For containerized services, rebuild the container if necessary
