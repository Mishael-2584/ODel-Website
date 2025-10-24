#!/bin/bash

echo "🔍 Testing Email Configuration for Webmin/Virtualmin"
echo "=================================================="

# Check if sendmail is available
echo "📧 Checking sendmail..."
if command -v sendmail &> /dev/null; then
    echo "✅ sendmail is available at: $(which sendmail)"
else
    echo "❌ sendmail not found"
fi

# Check if postfix is running
echo "📧 Checking Postfix..."
if systemctl is-active --quiet postfix; then
    echo "✅ Postfix is running"
else
    echo "❌ Postfix is not running"
fi

# Check ports
echo "📧 Checking email ports..."
netstat -tulpn | grep -E ":(25|587|465)" || echo "No email ports found"

# Test sendmail
echo "📧 Testing sendmail..."
echo "Test email from ODeL application" | sendmail -v root 2>&1 | head -5

echo "=================================================="
echo "🔧 Configuration suggestions:"
echo "1. Ensure Postfix is properly configured"
echo "2. Check Webmin/Virtualmin email settings"
echo "3. Verify domain configuration"
