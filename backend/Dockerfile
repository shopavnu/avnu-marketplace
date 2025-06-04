FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
# Copy root package.json and package-lock.json
# These are essential for installing dependencies for the entire monorepo
COPY package.json ./
COPY package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy the entire source code
COPY . .

# Ensure bullmq and bull-board dependencies are available at the root level
# This is critical for the @bull-board/api package which looks for bullmq in the root node_modules
RUN npm install bullmq@5.53.0 @bull-board/api @bull-board/nestjs @nestjs/bullmq --no-save

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
