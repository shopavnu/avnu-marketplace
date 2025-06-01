# Security Guidelines for Avnu Marketplace

This document outlines security best practices and standards for the Avnu Marketplace project.

## Environment Variables and Secrets Management

1. **Never commit secrets to the repository**
   - All sensitive credentials must be stored as environment variables
   - Use `.env.example` as a template but never include actual secrets
   - For local development, use `.env.local` (added to `.gitignore`)

2. **Production secrets management**
   - All production secrets should be managed through Render's environment variable system
   - Rotate API keys and passwords regularly (every 90 days)
   - Use different credentials for each environment (development, staging, production)

3. **Redis Connection Security**
   - Always use the proper Redis configuration with username 'default'
   - Use environment variables for Redis credentials (REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD, REDIS_TLS_ENABLED)
   - Current Redis Cloud instance: redis-15355.c13.us-east-1-3.ec2.redns.redis-cloud.com:15355

4. **Elasticsearch Security**
   - Use environment variables for Elasticsearch connection (ELASTICSEARCH_NODE, ELASTICSEARCH_API_KEY)
   - Avoid hardcoding these values in scripts or application code
   - Cloud instance: https://a81207e7dcc1427e913808856961ed8f.us-central1.gcp.cloud.es.io:443

## Authentication and Authorization

1. **Clerk Authentication**
   - All protected routes should use ClerkAuthGuard
   - Validate JWT tokens on the server side using ClerkAuthService.verifyToken()
   - Never expose user IDs or other sensitive information in public APIs

2. **API Security**
   - Use proper CORS configuration to restrict access to trusted domains
   - Implement rate limiting for all public-facing APIs
   - Validate and sanitize all input data

## Dependency Management

1. **Node.js Version**
   - Use Node.js 18.18.0 as specified in `.nvmrc` files
   - Ensure all developers use the same version to prevent inconsistencies

2. **Dependency Auditing**
   - Run `npm audit` regularly to check for vulnerabilities
   - Address high and critical vulnerabilities immediately
   - Update dependencies to latest secure versions when possible

3. **Docker Images**
   - Use specific version tags for Docker images (e.g., node:18.18.0-alpine)
   - Scan Docker images for vulnerabilities before deployment

## CI/CD Security

1. **GitHub Actions**
   - Security scanning workflow runs on all PRs and main branch
   - CodeQL analysis for static code analysis
   - Dependency vulnerability scanning
   - Secret scanning to prevent accidental commits of credentials

2. **Deployment Security**
   - Only deploy code that passes all security checks
   - Use least privilege access for deployment services
   - Monitor deployment logs for security issues

## Data Protection

1. **Database Security**
   - Use parameterized queries or ORM (Prisma) to prevent SQL injection
   - Encrypt sensitive data at rest
   - Implement proper data access controls

2. **Frontend Security**
   - Implement Content Security Policy (CSP)
   - Use HTTP Strict Transport Security (HSTS)
   - Protect against XSS by validating and sanitizing user input

## Incident Response

1. **Security Incident Handling**
   - Document and report any security incidents immediately
   - Have a clear escalation path for security issues
   - Regularly review and update security procedures

2. **Logging and Monitoring**
   - Implement comprehensive logging for security-relevant events
   - Monitor logs for suspicious activities
   - Set up alerts for potential security breaches

## Compliance

1. **Regular Security Reviews**
   - Conduct security reviews at least quarterly
   - Update security guidelines based on new threats and best practices
   - Perform penetration testing on critical components

2. **Security Training**
   - Ensure all developers are trained on security best practices
   - Stay informed about latest security threats and vulnerabilities
   - Promote a security-first development culture

## Reporting Security Issues

If you discover a security vulnerability, please email security@avnu.com instead of using the public issue tracker.
