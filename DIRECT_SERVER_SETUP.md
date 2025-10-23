# Direct Server Hosting Setup for odel.ueab.ac.ke

## 🎯 **Complete Server Setup Guide**

### **Server Details:**
- **Host**: 41.89.162.23
- **User**: odel
- **Password**: @Admin2024
- **Domain**: odel.ueab.ac.ke

## **1. Connect to Server**

```bash
ssh odel@41.89.162.23
# Password: @Admin2024
```

## **2. System Requirements Check**

```bash
# Check current system
uname -a
cat /etc/os-release

# Check if Node.js is installed
node --version
npm --version

# Check if Git is installed
git --version

# Check Apache status
systemctl status apache2
# OR
systemctl status httpd
```

## **3. Install Required Software**

### **A. Install Node.js (if not installed)**
```bash
# For Ubuntu/Debian:
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# For CentOS/RHEL:
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### **B. Install PM2 (Process Manager)**
```bash
sudo npm install -g pm2
```

### **C. Install Git (if not installed)**
```bash
# Ubuntu/Debian:
sudo apt-get install git

# CentOS/RHEL:
sudo yum install git
```

## **4. Clone and Setup Application**

### **A. Create Application Directory**
```bash
# Create directory for the app
sudo mkdir -p /var/www/odel.ueab.ac.ke
sudo chown odel:odel /var/www/odel.ueab.ac.ke
cd /var/www/odel.ueab.ac.ke
```

### **B. Clone Repository**
```bash
# Clone your repository (replace with your actual GitHub URL)
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .

# OR if you need to provide credentials:
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git .
# Enter your GitHub username and personal access token when prompted
```

### **C. Install Dependencies**
```bash
# Install all dependencies
npm install

# Install production dependencies only
npm ci --production
```

## **5. Environment Configuration**

### **A. Create Environment File**
```bash
# Create .env file
nano .env
```

### **B. Add Environment Variables**
```bash
# Copy your environment variables from local .env file
# Update SMTP settings for your server:

SUPABASE_DB_PASSWORD=Odel@2025!
SUPABASE_PROJECT_ID=vsirtnqfvimtkgabxpzy
SUPABASE_URL=https://vsirtnqfvimtkgabxpzy.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://vsirtnqfvimtkgabxpzy.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaXJ0bnFmdmltdGtnYWJ4cHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTM3OTksImV4cCI6MjA3NTk4OTc5OX0.HXVwXtP3bKdvhYsN197Y3xBcm8wY6zn7vq8wWd22fK4
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaXJ0bnFmdmltdGtnYWJ4cHp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTM3OTksImV4cCI6MjA3NTk4OTc5OX0.HXVwXtP3bKdvhYsN197Y3xBcm8wY6zn7vq8wWd22fK4
SUPABASE_ACCESS_TOKEN=sbp_5c614ca114a227c30b8da0029c3234de4169ef8c
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzaXJ0bnFmdmltdGtnYWJ4cHp5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDQxMzc5OSwiZXhwIjoyMDc1OTg5Nzk5fQ.sltRl-JxLU6iQznMgXQQJzj_EC5A-ehCx6kPpg8yYO4

# Zammad Configuration
NEXT_PUBLIC_ZAMMAD_URL=https://support.ueab.ac.ke
NEXT_PUBLIC_ZAMMAD_GROUP_ID=4
NEXT_PUBLIC_ZAMMAD_PRIORITY_ID=2
ZAMMAD_API_TOKEN=xd07L8w4rCem7WWZwc38vztr0VsnIOZB_XkkYMjPSDmPGsfOoo1TKwobAwYnaGnD

# Moodle Configuration
NEXT_PUBLIC_MOODLE_URL=https://ielearning.ueab.ac.ke/
MOODLE_API_TOKEN=b81f3639eb484fda3d4679960c91fbfa

# JWT Authentication
JWT_SECRET=2da876f7586ff222c2673efeb6932ee59b7f32c04e42439529248aefe4e87c50
JWT_EXPIRY=24h

# SMTP Configuration (Your Server)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@odel.ueab.ac.ke
SMTP_PASS=your_email_password_here
SMTP_SECURE=false
SMTP_FROM=noreply@odel.ueab.ac.ke

# Admin Configuration
ADMIN_EMAIL=admin@ueab.ac.ke
ADMIN_PASSWORD_HASH=$2b$10$NfOEZsGn/E753DWdSUN/weobXe0uHYY7HrehHHbAIDuXD/lFWIJoG

# Production Settings
NODE_ENV=production
NEXTAUTH_URL=https://odel.ueab.ac.ke
```

## **6. Build Application**

```bash
# Build the application for production
npm run build

# Verify build was successful
ls -la .next/
```

## **7. Configure Apache Virtual Host**

### **A. Create Apache Configuration**
```bash
# Create virtual host file
sudo nano /etc/apache2/sites-available/odel.ueab.ac.ke.conf
# OR for CentOS/RHEL:
sudo nano /etc/httpd/conf.d/odel.ueab.ac.ke.conf
```

### **B. Add Virtual Host Configuration**
```apache
<VirtualHost *:80>
    ServerName odel.ueab.ac.ke
    ServerAlias www.odel.ueab.ac.ke
    DocumentRoot /var/www/odel.ueab.ac.ke/.next
    
    # Proxy to Next.js
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Security headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/odel.ueab.ac.ke_error.log
    CustomLog ${APACHE_LOG_DIR}/odel.ueab.ac.ke_access.log combined
</VirtualHost>

# HTTPS Virtual Host (after SSL setup)
<VirtualHost *:443>
    ServerName odel.ueab.ac.ke
    ServerAlias www.odel.ueab.ac.ke
    DocumentRoot /var/www/odel.ueab.ac.ke/.next
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/odel.ueab.ac.ke.crt
    SSLCertificateKeyFile /etc/ssl/private/odel.ueab.ac.ke.key
    
    # Proxy to Next.js
    ProxyPreserveHost On
    ProxyPass /api/ http://localhost:3000/api/
    ProxyPassReverse /api/ http://localhost:3000/api/
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    
    # Security headers
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Logging
    ErrorLog ${APACHE_LOG_DIR}/odel.ueab.ac.ke_ssl_error.log
    CustomLog ${APACHE_LOG_DIR}/odel.ueab.ac.ke_ssl_access.log combined
</VirtualHost>
```

### **C. Enable Required Apache Modules**
```bash
# Enable required modules
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod rewrite

# Enable the site
sudo a2ensite odel.ueab.ac.ke.conf

# Test Apache configuration
sudo apache2ctl configtest
# OR for CentOS/RHEL:
sudo httpd -t

# Restart Apache
sudo systemctl restart apache2
# OR for CentOS/RHEL:
sudo systemctl restart httpd
```

## **8. Setup PM2 Process Manager**

### **A. Create PM2 Configuration**
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

### **B. Add PM2 Configuration**
```javascript
module.exports = {
  apps: [{
    name: 'odel-app',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/odel.ueab.ac.ke',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/odel-app-error.log',
    out_file: '/var/log/pm2/odel-app-out.log',
    log_file: '/var/log/pm2/odel-app.log'
  }]
}
```

### **C. Start Application with PM2**
```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Follow the instructions provided

# Check status
pm2 status
pm2 logs
```

## **9. Configure SSL Certificate**

### **A. Using Let's Encrypt (Recommended)**
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-apache
# OR for CentOS/RHEL:
sudo yum install certbot python3-certbot-apache

# Get SSL certificate
sudo certbot --apache -d odel.ueab.ac.ke -d www.odel.ueab.ac.ke

# Test auto-renewal
sudo certbot renew --dry-run
```

### **B. Manual SSL Certificate (Alternative)**
```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/certs /etc/ssl/private

# Copy your SSL certificate files
sudo cp your-certificate.crt /etc/ssl/certs/odel.ueab.ac.ke.crt
sudo cp your-private-key.key /etc/ssl/private/odel.ueab.ac.ke.key

# Set proper permissions
sudo chmod 644 /etc/ssl/certs/odel.ueab.ac.ke.crt
sudo chmod 600 /etc/ssl/private/odel.ueab.ac.ke.key
```

## **10. DNS Configuration**

### **A. Update DNS Records in Webmin**
```
Type: Address
Name: odel.ueab.ac.ke
Value: 41.89.162.23

Type: Address
Name: www.odel.ueab.ac.ke
Value: 41.89.162.23
```

## **11. Firewall Configuration**

```bash
# Allow required ports
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 3000/tcp  # Next.js (if needed for direct access)

# Enable firewall
sudo ufw enable
```

## **12. Testing and Verification**

### **A. Test Application**
```bash
# Check if PM2 is running
pm2 status

# Check Apache status
sudo systemctl status apache2

# Test local connection
curl http://localhost:3000

# Test through Apache
curl http://odel.ueab.ac.ke
curl https://odel.ueab.ac.ke
```

### **B. Monitor Logs**
```bash
# PM2 logs
pm2 logs odel-app

# Apache logs
sudo tail -f /var/log/apache2/odel.ueab.ac.ke_access.log
sudo tail -f /var/log/apache2/odel.ueab.ac.ke_error.log
```

## **13. Maintenance Commands**

### **A. Update Application**
```bash
cd /var/www/odel.ueab.ac.ke
git pull origin main
npm install
npm run build
pm2 restart odel-app
```

### **B. Monitor Performance**
```bash
# PM2 monitoring
pm2 monit

# System resources
htop
df -h
free -h
```

## **14. Backup Strategy**

```bash
# Create backup script
nano /home/odel/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/odel/backups"
APP_DIR="/var/www/odel.ueab.ac.ke"

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/odel-app-$DATE.tar.gz -C $APP_DIR .
echo "Backup created: $BACKUP_DIR/odel-app-$DATE.tar.gz"
```

```bash
# Make executable
chmod +x /home/odel/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /home/odel/backup.sh
```

## **✅ Benefits of Direct Hosting:**

- ✅ **Full Control** - Complete server control
- ✅ **Cost Effective** - No hosting fees
- ✅ **Custom Domain** - Direct domain control
- ✅ **Performance** - Direct server access
- ✅ **Security** - Your own security measures
- ✅ **Scalability** - Scale as needed

## **🚀 Your App Will Be Available At:**

- **http://odel.ueab.ac.ke** (HTTP)
- **https://odel.ueab.ac.ke** (HTTPS)
- **http://www.odel.ueab.ac.ke** (WWW)
- **https://www.odel.ueab.ac.ke** (WWW HTTPS)
