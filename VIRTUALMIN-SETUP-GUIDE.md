# Virtualmin Apache Proxy Setup Guide

## Overview
This guide will help you configure Apache to proxy requests to your Next.js application running on port 3000.

## Prerequisites
✅ Node.js application is built and ready
✅ Production server is running on port 3000
✅ Apache proxy modules are enabled

## Step-by-Step Setup

### 1. Access Virtualmin
1. Go to `https://odel.ueab.ac.ke:10000`
2. Login with your admin credentials

### 2. Navigate to Your Virtual Server
1. Click on "odel.ueab.ac.ke" virtual server
2. Go to "Apache Website" → "Edit Directives"

### 3. Apply the Proxy Configuration
1. **Delete** the existing configuration
2. **Copy** the entire contents of `apache-proxy-config.conf`
3. **Paste** it into the "Apache Directives" text area
4. Click "Save"

### 4. Restart Apache
1. Go to "System Settings" → "Bootup and Shutdown"
2. Find "Apache" and click "Restart"
3. Or use the command: `sudo systemctl restart apache2`

### 5. Test Your Setup
1. Visit `http://odel.ueab.ac.ke`
2. You should see your Next.js application
3. Test both HTTP and HTTPS

## Troubleshooting

### If the site shows "Apache default page":
- The proxy configuration wasn't applied correctly
- Restart Apache and check the configuration

### If you get "Connection refused":
- Your Node.js app isn't running on port 3000
- Run: `cd /home/odel/public_html && ./start-production.sh`

### If you get SSL errors:
- Check that SSL certificates are properly configured
- The configuration includes SSL setup for HTTPS

## Configuration Details

The Apache configuration includes:
- ✅ Proxy setup for both HTTP and HTTPS
- ✅ SSL certificate configuration
- ✅ Proper subdomain redirects (webmail, admin)
- ✅ AWStats functionality preserved
- ✅ Logging configuration

## Important Notes

1. **Keep the Node.js app running**: Use `./start-production.sh` to start it
2. **Port 3000**: The app must run on port 3000 for the proxy to work
3. **SSL**: Both HTTP and HTTPS are configured
4. **Subdomains**: webmail and admin subdomains redirect to their respective services

## Monitoring

To check if everything is working:
```bash
# Check if Node.js is running
ps aux | grep "next start"

# Check if port 3000 is listening
netstat -tlnp | grep :3000

# Test local connection
curl http://localhost:3000
```

## Files Reference
- Configuration: `/home/odel/public_html/apache-proxy-config.conf`
- Startup script: `/home/odel/public_html/start-production.sh`
- Application: `/home/odel/public_html/`

