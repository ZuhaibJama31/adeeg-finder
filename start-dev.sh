#!/bin/bash
# Start the Expo dev server and the Replit webview landing page concurrently

# Start dev landing page on port 5000
node server/dev-server.js &
DEV_SERVER_PID=$!

# Start Expo dev server on port 8081
export EXPO_PUBLIC_DOMAIN="${REPLIT_DEV_DOMAIN:-localhost}"
export EXPO_PUBLIC_REPL_ID="${REPL_ID:-}"

pnpm exec expo start --localhost --port 8081

# Clean up
kill $DEV_SERVER_PID 2>/dev/null
