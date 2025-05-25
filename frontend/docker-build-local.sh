#!/bin/bash

# Navigate to the script's directory (frontend) to ensure paths are correct
cd "$(dirname "$0")" || exit

# Load environment variables from .env file if it exists
if [ -f .env ]; then
  echo "Loading environment variables from .env file..."
  export $(grep -v '^#' .env | sed -e 's/[[:space:]]*#.*//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' | xargs)
fi

# Check if NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set
if [ -z "${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}" ]; then
  echo "Error: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not set."
  echo "Please ensure a .env file exists in $(pwd) with this variable."
  exit 1
fi

echo "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is set."
echo "Starting local Docker build..."

docker run --rm \
  -v "$(pwd)":/app \
  -w /app \
  -e NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="${NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}" \
  node:20-alpine \
  sh -c "echo 'Cleaning up old node_modules and .next...' && rm -rf /app/node_modules /app/.next && echo 'Running npm ci --legacy-peer-deps...' && npm ci --legacy-peer-deps && echo 'Running npm run build...' && npm run build"

BUILD_STATUS=$?
if [ ${BUILD_STATUS} -eq 0 ]; then
  echo "Local Docker build completed successfully."
else
  echo "Local Docker build failed with status: ${BUILD_STATUS}."
fi

exit ${BUILD_STATUS}
