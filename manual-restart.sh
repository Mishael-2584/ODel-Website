#!/bin/bash

echo "🔄 Manual Application Restart Script"
echo "=================================="

# Kill processes
echo "🛑 Killing existing processes..."
pkill -f "next start"
sleep 2

# Kill port 3000
echo "🛑 Freeing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 2

# Clear cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

# Build
echo "🔨 Building application..."
npm run build

# Start
echo "🚀 Starting application..."
PORT=3000 npm start > app.log 2>&1 &

echo "✅ Restart complete!"
echo "📝 Check app.log for details"
echo "🌐 Application should be available at: https://odel.ueab.ac.ke"
