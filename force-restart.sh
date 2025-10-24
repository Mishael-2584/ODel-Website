#!/bin/bash

# Force restart script for UEAB ODel Application
# This script aggressively stops the application and restarts it

LOG_FILE="/home/odel/public_html/update.log"
APP_DIR="/home/odel/public_html"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Starting force restart process..."

# Navigate to the application directory
cd "$APP_DIR"

# Aggressively stop all processes
log "🛑 Force stopping all application processes..."
pkill -f "next start" || true
pkill -f "next-server" || true
pkill -f "node.*next" || true
pkill -f "npm start" || true
sleep 3

# Force kill port 3000
log "🔪 Force killing port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

# Verify port is free
PORT_CHECK=$(netstat -tulpn | grep :3000)
if [ ! -z "$PORT_CHECK" ]; then
    log "❌ Port 3000 still in use. Manual cleanup required."
    log "   Run: lsof -ti:3000 | xargs kill -9"
    exit 1
fi

log "✅ Port 3000 is now free"

# Clear cache and rebuild
log "🧹 Clearing cache and rebuilding..."
rm -rf .next
npm run build

if [ $? -ne 0 ]; then
    log "❌ Build failed. Check the errors above."
    exit 1
fi

# Start the application
log "🚀 Starting application..."
PORT=3000 nohup npm start > app.log 2>&1 &
sleep 5

# Verify it's running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    log "✅ Force restart completed successfully!"
    log "🌐 Application is running at: https://odel.ueab.ac.ke"
else
    log "❌ Application failed to start. Check app.log for details."
    exit 1
fi
