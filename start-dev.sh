#!/bin/bash

# REEFX Development Environment Startup Script

echo "🚀 Starting REEFX Development Environment..."

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "next dev" 2>/dev/null
pkill -f "stripe listen" 2>/dev/null
sleep 2

# Create logs directory
mkdir -p logs

# Get the absolute path to the project directory
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start Next.js in a new terminal tab
echo "🌐 Starting Next.js in new terminal tab..."
osascript -e "tell application \"Terminal\"
    do script \"cd '$PROJECT_DIR/web' && echo '🌐 Next.js Server' && npm run dev\"
end tell"

# Wait for Next.js to start
sleep 3

# Start Stripe CLI in a new terminal tab
echo "💳 Starting Stripe CLI in new terminal tab..."
osascript -e "tell application \"Terminal\"
    do script \"cd '$PROJECT_DIR' && echo '💳 Stripe Webhook Listener' && stripe listen --forward-to localhost:3000/api/stripe/webhook\"
end tell"

echo ""
echo "✅ Development environment started in separate terminal tabs!"
echo ""
echo "📊 Services:"
echo "   • Next.js:  http://localhost:3000"
echo "   • Stripe:   Webhooks forwarding to /api/stripe/webhook"
echo ""
echo "🛑 To stop all services, run: ./stop-dev.sh"
echo ""
