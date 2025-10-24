#!/bin/bash

# Webhook script for automatic GitHub updates
# This script can be called by a webhook to automatically update the application

LOG_FILE="/home/odel/public_html/update.log"
APP_DIR="/home/odel/public_html"

# Log function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log "🔄 Starting automatic update process..."

# Navigate to application directory
cd "$APP_DIR"

# Pull latest changes
log "📥 Pulling latest changes from GitHub..."
git pull origin master >> "$LOG_FILE" 2>&1

if [ $? -eq 0 ]; then
    log "✅ Git pull successful"
    
    # Check if package.json changed
    if git diff HEAD~1 HEAD --name-only | grep -q "package.json"; then
        log "📦 Installing dependencies..."
        npm install >> "$LOG_FILE" 2>&1
    fi
    
    # Build application
    log "🔨 Building application..."
    npm run build >> "$LOG_FILE" 2>&1
    
    # Restart application
    log "🚀 Restarting application..."
    pkill -f "next start" || true
    sleep 3
    PORT=3000 npm start >> "$LOG_FILE" 2>&1 &
    
    log "✅ Automatic update completed successfully!"
else
    log "❌ Git pull failed"
    exit 1
fi
