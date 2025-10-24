#!/bin/bash

# Script to configure Apache proxy for ODel Next.js application
# This script helps set up the proxy configuration in Virtualmin

echo "🔧 Configuring Apache proxy for ODel Next.js application..."

# Check if Apache proxy modules are enabled
echo "📋 Checking Apache proxy modules..."
if ! apache2ctl -M | grep -q "proxy_module"; then
    echo "⚠️  Apache proxy module not enabled. You need to enable it in Virtualmin:"
    echo "   1. Go to Virtualmin → System Settings → Features and Plugins"
    echo "   2. Enable 'Apache proxy' feature"
    echo "   3. Restart Apache"
    exit 1
fi

echo "✅ Apache proxy module is enabled"

# Instructions for applying the configuration
echo ""
echo "📝 To apply the proxy configuration:"
echo ""
echo "1. Login to Virtualmin (https://odel.ueab.ac.ke:10000)"
echo "2. Go to 'odel.ueab.ac.ke' virtual server"
echo "3. Click 'Apache Website' → 'Edit Directives'"
echo "4. Replace the entire configuration with the contents of 'apache-proxy-config.conf'"
echo "5. Click 'Save' and restart Apache"
echo ""
echo "📄 Configuration file: /home/odel/public_html/apache-proxy-config.conf"
echo ""
echo "🔄 After applying, your Next.js app will be accessible at:"
echo "   - http://odel.ueab.ac.ke"
echo "   - https://odel.ueab.ac.ke"
echo ""
echo "⚠️  Make sure your Next.js app is running on port 3000:"
echo "   pm2 status"
