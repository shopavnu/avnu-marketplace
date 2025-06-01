# Dockerfile
# Stage 1: Build the application
FROM node:20-alpine AS builder

# Set WORKDIR to represent the monorepo root in the container
WORKDIR /app

# Set build-time arguments
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL

# Set environment variables from build-time arguments for the build stage
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy root package.json and package-lock.json
# These are essential for installing dependencies for the entire monorepo
COPY package.json ./
COPY package-lock.json ./
# If you have a .npmrc file at the root of your monorepo and need it for `npm ci`,
# uncomment the following line:
# COPY .npmrc ./

# Install ALL monorepo dependencies using the root package-lock.json
RUN npm ci --legacy-peer-deps

# Diagnostic: List contents of Clerk package and server subdir

# Copy the entire frontend directory from the build context (monorepo root)
# into /app/frontend in the builder stage.
COPY ./frontend ./frontend

# Set the working directory to the frontend app for the build
WORKDIR /app/frontend

# Build the Next.js application (this will use frontend/package.json scripts)
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine AS runtime

# Set WORKDIR for the running application
WORKDIR /app

ENV NODE_ENV production

# Pass ARG values to ENV for runtime
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy build artifacts from the builder stage.
# The built frontend app is in /app/frontend/ in the builder.
COPY --from=builder /app/frontend/next.config.js ./next.config.js
COPY --from=builder /app/frontend/public ./public
COPY --from=builder /app/frontend/.next ./.next

# Copy the frontend's package.json to /app in the runtime stage.
# This is needed for the `npm run start` command.
COPY --from=builder /app/frontend/package.json ./package.json

# Copy the node_modules from the monorepo root in the builder stage.
# These were installed by `npm ci` at the root and should contain dependencies
# for all workspaces, including the frontend.
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# CMD will use /app/package.json (which is frontend's) and /app/node_modules (from monorepo root)
CMD ["npm", "run", "start"]