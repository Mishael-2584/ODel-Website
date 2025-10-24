# ODel Website - Virtualmin Configuration Guide

## Current Status
✅ Next.js application is running on port 3000
✅ PM2 process manager is managing the application
❌ Domain still shows Virtualmin default page

## Solution: Configure Virtualmin to Proxy to Node.js App

### Method 1: Through Virtualmin Web Interface (Recommended)

1. **Login to Virtualmin**
   - Go to: https://odel.ueab.ac.ke:10000
   - Login with your admin credentials

2. **Navigate to Virtual Server**
   - Click on "odel.ueab.ac.ke" virtual server

3. **Configure Apache Website**
   - Go to "Apache Website" → "Edit Directives"
   - Replace the entire configuration with the contents from `apache-proxy-config.conf`
   - Click "Save"

4. **Enable Proxy Modules** (if not already enabled)
   - Go to "System Settings" → "Features and Plugins"
   - Enable "Apache proxy" feature
   - Restart Apache

### Method 2: Manual Apache Configuration

If you have root access, you can manually update the Apache configuration:

```bash
# Backup current configuration
sudo cp /etc/apache2/sites-available/odel.ueab.ac.ke.conf /etc/apache2/sites-available/odel.ueab.ac.ke.conf.backup

# Replace with proxy configuration
sudo cp /home/odel/public_html/apache-proxy-config.conf /etc/apache2/sites-available/odel.ueab.ac.ke.conf

# Enable proxy modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers

# Test configuration
sudo apache2ctl configtest

# Restart Apache
sudo systemctl restart apache2
```

### Method 3: Using .htaccess (Simpler but less efficient)

The `.htaccess` file has been created in your public_html directory. This method uses Apache's mod_rewrite to proxy requests.

### Verification Steps

After applying any of the above methods:

1. **Check if your app is running:**
   ```bash
   pm2 status
   ```

2. **Test the proxy:**
   ```bash
   curl -I http://odel.ueab.ac.ke
   ```

3. **Visit your domain:**
   - http://odel.ueab.ac.ke
   - https://odel.ueab.ac.ke

### Troubleshooting

If you still see the Virtualmin default page:

1. **Clear browser cache**
2. **Check Apache error logs:**
   ```bash
   tail -f /var/log/virtualmin/odel.ueab.ac.ke_error_log
   ```
3. **Verify proxy modules are loaded:**
   ```bash
   apache2ctl -M | grep proxy
   ```
4. **Check if Next.js app is responding:**
   ```bash
   curl http://localhost:3000
   ```

### Files Created

- `apache-proxy-config.conf` - Complete Apache configuration for proxy
- `setup-proxy.sh` - Setup script with instructions
- `.htaccess` - Alternative proxy method using mod_rewrite

### Next Steps

Once the proxy is working:
1. Your Next.js application will be accessible at your domain
2. You can continue using `./update.sh` to pull updates
3. The application will automatically restart after updates
