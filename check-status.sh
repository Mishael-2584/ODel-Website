#!/bin/bash

# Status check script for UEAB ODel Next.js application
# This script checks the health of your application and provides status information

echo "🔍 UEAB ODel Application Status Check"
echo "======================================"

# Check if Next.js app is running
echo "📊 Application Status:"
if ps aux | grep -q "next start" | grep -v grep; then
    echo "✅ Next.js application is RUNNING"
    NEXTJS_PID=$(ps aux | grep "next start" | grep -v grep | awk '{print $2}')
    echo "   Process ID: $NEXTJS_PID"
else
    echo "❌ Next.js application is NOT RUNNING"
fi

# Check port 3000
echo ""
echo "🌐 Port Status:"
if netstat -tulpn | grep -q ":3000"; then
    echo "✅ Port 3000 is in use"
    PORT_INFO=$(netstat -tulpn | grep ":3000")
    echo "   $PORT_INFO"
else
    echo "❌ Port 3000 is not in use"
fi

# Check local application response
echo ""
echo "🔗 Local Application Response:"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Local application responds with HTTP 200"
else
    echo "❌ Local application responds with HTTP $HTTP_CODE"
fi

# Check public website
echo ""
echo "🌍 Public Website Response:"
PUBLIC_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://odel.ueab.ac.ke 2>/dev/null)
if [ "$PUBLIC_CODE" = "200" ]; then
    echo "✅ Public website responds with HTTP 200"
else
    echo "❌ Public website responds with HTTP $PUBLIC_CODE"
fi

# Check recent logs
echo ""
echo "📝 Recent Application Logs:"
if [ -f "/home/odel/public_html/app.log" ]; then
    echo "Last 5 lines from app.log:"
    tail -5 /home/odel/public_html/app.log
else
    echo "No app.log file found"
fi

# Check update log
echo ""
echo "📋 Recent Update Logs:"
if [ -f "/home/odel/public_html/update.log" ]; then
    echo "Last 3 updates:"
    tail -10 /home/odel/public_html/update.log | grep "Starting update process\|Update completed\|Application status"
else
    echo "No update.log file found"
fi

echo ""
echo "🔧 Quick Commands:"
echo "  • Check status: ./check-status.sh"
echo "  • Update app: ./update.sh"
echo "  • View logs: tail -f app.log"
echo "  • View update log: tail -f update.log"
