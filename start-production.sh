#!/bin/bash

# Script to start the Next.js application in production mode
# This script ensures the app is running on port 3000 for Apache proxy

echo "🚀 Starting UEAB ODeL Next.js Application in Production Mode..."

# Change to the application directory
cd /home/odel/public_html

# Kill any existing Next.js processes
echo "🔄 Stopping any existing Next.js processes..."
pkill -f "next dev" || true
pkill -f "next start" || true

# Wait a moment for processes to stop
sleep 2

# Build the application if needed
echo "📦 Building the application..."
npm run build

# Start the production server on port 3000
echo "🌐 Starting production server on port 3000..."
PORT=3000 npm start &

# Wait for the server to start
sleep 5

# Check if the server is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Production server is running successfully on port 3000"
    echo "🌍 Your application should now be accessible via Apache proxy"
    echo ""
    echo "📋 Next steps:"
    echo "1. Apply the Apache proxy configuration in Virtualmin"
    echo "2. Restart Apache if needed"
    echo "3. Test your domain: http://odel.ueab.ac.ke"
    echo ""
    echo "📄 Configuration file: /home/odel/public_html/apache-proxy-config.conf"
else
    echo "❌ Failed to start the production server"
    echo "Please check the logs and try again"
fi

