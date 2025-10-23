#!/bin/bash

# Enhanced update script for UEAB ODel Next.js application
# This script pulls latest changes from GitHub and rebuilds the application smoothly

LOG_FILE="/home/odel/public_html/update.log"
APP_DIR="/home/odel/public_html"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Starting update process..."

# Navigate to the application directory
cd "$APP_DIR"

# Check if git repository is clean
if ! git diff-index --quiet HEAD --; then
    log "⚠️  Warning: You have uncommitted changes. Please commit or stash them first."
    log "   Use 'git status' to see what files have changed."
    exit 1
fi

# Pull latest changes from GitHub
log "📥 Pulling latest changes from GitHub..."
git pull origin master

if [ $? -ne 0 ]; then
    log "❌ Git pull failed. Please check your internet connection and try again."
    exit 1
fi

# Check if package.json changed (indicating dependency updates)
if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
    log "📦 Package.json changed, installing dependencies..."
    npm install
fi

# Clear Next.js cache to prevent build issues
log "🧹 Clearing Next.js cache..."
rm -rf .next

# Build the application for production
log "🔨 Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    log "❌ Build failed. Please check the build errors above."
    exit 1
fi

# Stop existing application gracefully
log "🛑 Stopping existing application..."
pkill -f "next start" || true
sleep 3

# Ensure port 3000 is free
PORT_CHECK=$(netstat -tulpn | grep :3000)
if [ ! -z "$PORT_CHECK" ]; then
    log "⚠️  Port 3000 still in use, forcing cleanup..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start the application in production mode
log "🚀 Starting application in production mode..."
PORT=3000 nohup npm start > app.log 2>&1 &
sleep 5

# Verify the application is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log "✅ Update completed successfully!"
    log "🌐 Your application is now running with the latest changes."
    log "📝 Check the application at: https://odel.ueab.ac.ke"
    log "📊 Application status: RUNNING"
else
    log "❌ Application failed to start properly. Check app.log for details."
    log "📊 Application status: FAILED"
    exit 1
fi