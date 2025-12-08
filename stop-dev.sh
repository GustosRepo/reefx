#!/bin/bash

# REEFX Development Environment Shutdown Script

echo "🛑 Stopping REEFX Development Environment..."

# Stop Next.js
if [ -f logs/nextjs.pid ]; then
    NEXT_PID=$(cat logs/nextjs.pid)
    echo "🌐 Stopping Next.js (PID: $NEXT_PID)..."
    kill $NEXT_PID 2>/dev/null
    rm logs/nextjs.pid
    echo "   ✓ Next.js stopped"
else
    echo "🌐 Stopping Next.js..."
    pkill -f "next dev"
    echo "   ✓ Next.js stopped"
fi

# Stop Stripe CLI
if [ -f logs/stripe.pid ]; then
    STRIPE_PID=$(cat logs/stripe.pid)
    echo "💳 Stopping Stripe CLI (PID: $STRIPE_PID)..."
    kill $STRIPE_PID 2>/dev/null
    rm logs/stripe.pid
    echo "   ✓ Stripe CLI stopped"
else
    echo "💳 Stopping Stripe CLI..."
    pkill -f "stripe listen"
    echo "   ✓ Stripe CLI stopped"
fi

# Final cleanup
pkill -f "next dev" 2>/dev/null
pkill -f "stripe listen" 2>/dev/null

echo ""
echo "✅ Development environment stopped!"
echo ""
