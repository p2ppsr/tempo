#!/usr/bin/env bash
set -e

# Check if dist directory exists
if [ ! -d "dist" ]; then
  echo "Error: dist directory not found. Make sure to run 'npm run build' first."
  exit 1
fi

# Check if the main file exists
if [ ! -f "dist/src/index.js" ]; then
  echo "Error: dist/src/index.js not found. Build may have failed."
  exit 1
fi

if [ "$NODE_ENV" = "production" ] || [ "$NODE_ENV" = "staging" ]; then
  echo "Starting in production mode..."
  node dist/src/index.js
else
  echo "Starting in development mode with inspector..."
  node --inspect=0.0.0.0 dist/src/index.js
fi
