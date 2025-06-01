FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
# Copy root package.json and package-lock.json
# These are essential for installing dependencies for the entire monorepo
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Explicitly install backend workspace dependencies to ensure links/stubs
WORKDIR /app/backend
RUN npm install --legacy-peer-deps

# Explicitly install bullmq to ensure it's available at both the root and backend levels
RUN npm install bullmq@5.53.0 --save
WORKDIR /app
RUN npm install bullmq@5.53.0 --save

# Also install @bull-board dependencies at the root level to ensure compatibility
RUN npm install @bull-board/api @bull-board/nestjs

# Prisma generate (if needed, assuming schema is copied by 'COPY . .')
# Ensure 'backend' is the correct name in your root package.json's workspaces array
# The build output will typically be in /app/backend/dist
RUN npm run build --workspace=backend

# Remove development dependencies
RUN npm prune --production

# Production stage
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=production

WORKDIR /app

# Copy built application from builder stage
# Copy built application artifacts from the builder stage
# Source paths are relative to /app in the builder stage (monorepo root)
# Destination paths are relative to /app in this production stage
COPY --from=builder /app/backend/dist ./dist

# Copy the backend's package.json to be the main package.json for this image
# This is important for context if npm scripts from backend/package.json were to be used
COPY --from=builder /app/backend/package.json ./package.json

# Copy the node_modules from the builder stage.
# This includes all dependencies for the monorepo.
# The 'npm prune --production' in the builder stage helps reduce its size.
COPY --from=builder /app/node_modules ./node_modules

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"]
