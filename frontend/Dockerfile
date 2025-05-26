FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
# Copy root package.json and package-lock.json
# These are essential for installing dependencies for the entire monorepo
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Define build-time argument for Clerk publishable key
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Set environment variable from the build-time argument
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}

# Build the application
# Build the frontend application, targeting the 'frontend' workspace
# Ensure 'frontend' is the correct name in your root package.json's workspaces array
# The build output will typically be in /app/frontend/.next
RUN npm run build --workspace=frontend

# Production stage
FROM node:20-alpine

# Set environment variables
ENV NODE_ENV=production

WORKDIR /app

# Copy built application from builder stage
# Copy built application artifacts from the builder stage
# Source paths are relative to /app in the builder stage (monorepo root)
# Destination paths are relative to /app in this production stage
COPY --from=builder /app/frontend/.next ./.next
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/next.config.js ./next.config.js

# Copy the frontend's package.json to be the main package.json for this image
# This is important so that "npm start" uses the scripts defined in frontend's package.json
COPY --from=builder /app/frontend/package.json ./package.json

# Copy the node_modules from the builder stage.
# This includes all dependencies for the monorepo.
# While not the smallest possible, it ensures all necessary dependencies for the frontend are present.
# For optimization, consider Next.js standalone output or multi-stage builds that isolate workspace dependencies.
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
