#!/bin/bash

echo "🔄 Restarting UEAB ODeL Application..."

# Kill all processes using port 3000
echo "🛑 Killing existing processes..."
pkill -f "next start" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 3

# Clear Next.js cache
echo "🧹 Clearing cache..."
rm -rf .next

# Build the application
echo "🔨 Building application..."
npm run build

# Start the application
echo "🚀 Starting application..."
PORT=3000 nohup npm start > app.log 2>&1 &

# Wait for startup
sleep 5

# Check if application is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ Application started successfully!"
    echo "🌐 Application is running at: https://odel.ueab.ac.ke"
else
    echo "❌ Application failed to start. Check app.log for details."
fi
