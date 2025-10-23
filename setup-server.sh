#!/bin/bash

# UEAB ODeL Application Setup Script
# Run this script on your server: 41.89.162.23

echo "🚀 Starting UEAB ODeL Application Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root. Run as 'odel' user."
    exit 1
fi

# Check system requirements
print_status "Checking system requirements..."

# Check OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
    print_status "Detected OS: $OS $VER"
else
    print_error "Cannot detect OS version"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing Node.js 18..."
    
    if [[ "$OS" == *"Ubuntu"* ]] || [[ "$OS" == *"Debian"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt-get install -y nodejs
    elif [[ "$OS" == *"CentOS"* ]] || [[ "$OS" == *"Red Hat"* ]]; then
        curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
        sudo yum install -y nodejs
    else
        print_error "Unsupported OS. Please install Node.js manually."
        exit 1
    fi
else
    print_status "Node.js is already installed: $(node --version)"
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm not found. Please install npm."
    exit 1
else
    print_status "npm is already installed: $(npm --version)"
fi

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Create application directory
APP_DIR="/var/www/odel.ueab.ac.ke"
print_status "Creating application directory: $APP_DIR"
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR

# Clone repository (you'll need to provide your GitHub URL)
print_warning "Please provide your GitHub repository URL:"
read -p "GitHub URL: " GITHUB_URL

if [ -z "$GITHUB_URL" ]; then
    print_error "GitHub URL is required. Exiting..."
    exit 1
fi

print_status "Cloning repository from: $GITHUB_URL"
cd $APP_DIR
git clone $GITHUB_URL .

if [ $? -ne 0 ]; then
    print_error "Failed to clone repository. Please check the URL and try again."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install dependencies."
    exit 1
fi

# Create environment file
print_status "Creating environment file..."
cat > .env << EOF
# Supabase Configuration
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

# SMTP Configuration (Update these!)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=noreply@odel.ueab.ac.ke
SMTP_PASS=your_email_password_here
SMTP_SECURE=false
SMTP_FROM=noreply@odel.ueab.ac.ke

# Admin Configuration
ADMIN_EMAIL=admin@ueab.ac.ke
ADMIN_PASSWORD_HASH=\$2b\$10\$NfOEZsGn/E753DWdSUN/weobXe0uHYY7HrehHHbAIDuXD/lFWIJoG

# Production Settings
NODE_ENV=production
NEXTAUTH_URL=https://odel.ueab.ac.ke
EOF

print_warning "Please update the SMTP_PASS in .env file with your actual email password!"

# Build application
print_status "Building application for production..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Create PM2 ecosystem file
print_status "Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'odel-app',
    script: 'npm',
    args: 'start',
    cwd: '$APP_DIR',
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
EOF

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 startup
print_status "Setting up PM2 startup..."
pm2 startup

print_warning "Please run the command shown above to setup PM2 startup!"

# Create Apache virtual host configuration
print_status "Creating Apache virtual host configuration..."
sudo tee /etc/apache2/sites-available/odel.ueab.ac.ke.conf > /dev/null << EOF
<VirtualHost *:80>
    ServerName odel.ueab.ac.ke
    ServerAlias www.odel.ueab.ac.ke
    DocumentRoot $APP_DIR/.next
    
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
    ErrorLog \${APACHE_LOG_DIR}/odel.ueab.ac.ke_error.log
    CustomLog \${APACHE_LOG_DIR}/odel.ueab.ac.ke_access.log combined
</VirtualHost>
EOF

# Enable required Apache modules
print_status "Enabling Apache modules..."
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod headers
sudo a2enmod ssl
sudo a2enmod rewrite

# Enable the site
print_status "Enabling Apache site..."
sudo a2ensite odel.ueab.ac.ke.conf

# Test Apache configuration
print_status "Testing Apache configuration..."
sudo apache2ctl configtest

if [ $? -eq 0 ]; then
    print_status "Apache configuration is valid. Restarting Apache..."
    sudo systemctl restart apache2
else
    print_error "Apache configuration has errors. Please fix them manually."
fi

# Setup firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

print_status "✅ Basic setup completed!"
print_warning "Next steps:"
echo "1. Update DNS records in Webmin to point to 41.89.162.23"
echo "2. Update SMTP_PASS in .env file"
echo "3. Run: sudo certbot --apache -d odel.ueab.ac.ke -d www.odel.ueab.ac.ke"
echo "4. Test your application at: http://odel.ueab.ac.ke"

print_status "🎉 Setup script completed!"
