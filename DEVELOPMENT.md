# Avnu Marketplace Development Guide

## Node.js Version Requirements

This project requires Node.js 20.x and npm 10.x:

- Node.js: **v20.11.0 or higher** (current LTS)
- npm: **v10.0.0 or higher**

### Setting Up Your Local Environment

We recommend using NVM (Node Version Manager) to manage your Node.js versions:

```bash
# Install Node.js 20.x LTS
nvm install 20.11.1

# Use it for this project
nvm use 20.11.1

# Set it as your default
nvm alias default 20.11.1
```

### CI Environment

The CI environment also runs on Node.js 20.11.0. All GitHub Actions workflows are configured to use this version.

### NPM Configuration

Our project uses relaxed npm settings in `.npmrc` to handle dependency conflicts and ensure consistent installations:

```
legacy-peer-deps=true
engine-strict=false
package-lock=false
force=true
```

These settings help avoid common issues with package installation and version conflicts, especially with the `multer` package which is specifically overridden to version 2.0.1.

## Installation and Setup

After ensuring the correct Node.js version:

```bash
# Clean installation
rm -rf node_modules package-lock.json
npm install

# Start development server
npm run dev
```

## Recent Dependency Upgrades

### June 2025 Upgrade

The following upgrades were completed to modernize the codebase:

1. **Node.js Version**: Upgraded from Node.js 18.x to Node.js 20.11.1
2. **Apollo Server**: Migrated from Apollo Server v3 (`apollo-server-express`) to Apollo Server v4 (`@apollo/server`)
3. **GraphQL Subscriptions**: Replaced deprecated `subscriptions-transport-ws` package with the modern `graphql-ws` package

### Remaining Deprecated Dependencies

The following deprecated packages should be reviewed for potential future upgrades:

1. Any RxJS compatibility issues (versions 6.x vs 7.x)
2. Review for other deprecated packages flagged by npm

## Troubleshooting

If you encounter dependency issues:

1. Verify you're using the correct Node.js version with `node -v`
2. Try a clean install: `rm -rf node_modules package-lock.json && npm install`
3. Review the `.npmrc` settings and make sure they're applied
