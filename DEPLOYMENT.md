# UEAB ODel Deployment Guide

## Quick Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database connection tested
- [ ] API endpoints verified
- [ ] SSL certificate obtained
- [ ] Domain DNS configured
- [ ] Backup strategy in place

### Local Testing
```bash
# Build and test locally
npm run build
npm start

# Test on local network
# Access from: http://localhost:3000
```

### Production Deployment Options

## Option 1: Vercel (Easiest - Recommended for Quick Start)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

**Pros**: Automatic deployments, CDN, SSL, zero config
**Cons**: Vendor lock-in, costs for high traffic

## Option 2: Self-Hosted with Webmin/Virtualmin (Full Control)

### Server Requirements
- Ubuntu 20.04/22.04 or CentOS 8
- 2GB RAM minimum (4GB recommended)
- 20GB disk space
- Root or sudo access

### Installation Steps

#### 1. Install Webmin/Virtualmin
```bash
# Download installation script
wget https://software.virtualmin.com/gpl/scripts/install.sh

# Run installation
sudo sh install.sh

# Access Webmin at: https://your-server:10000
```

#### 2. Install Node.js
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify
node --version  # Should show v18.x.x
npm --version
```

#### 3. Install PM2
```bash
# Install PM2 globally
sudo npm install -g pm2

# Configure PM2 startup
pm2 startup systemd
```

#### 4. Deploy Application
```bash
# Create deployment directory
sudo mkdir -p /var/www/odel.ueab.ac.ke
sudo chown -R $USER:$USER /var/www/odel.ueab.ac.ke

# Clone repository
cd /var/www/odel.ueab.ac.ke
git clone <your-repo-url> .

# Install dependencies
npm install

# Create .env.local file
nano .env.local
# Add your environment variables

# Build application
npm run build

# Start with PM2
pm2 start npm --name "ueab-odel" -- start

# Save PM2 configuration
pm2 save
```

#### 5. Configure Nginx
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/odel.ueab.ac.ke
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name odel.ueab.ac.ke www.odel.ueab.ac.ke;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name odel.ueab.ac.ke www.odel.ueab.ac.ke;

    # SSL Configuration (will be added by Certbot)
    ssl_certificate /etc/letsencrypt/live/odel.ueab.ac.ke/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/odel.ueab.ac.ke/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=3600, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/odel.ueab.ac.ke /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. Setup SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d odel.ueab.ac.ke -d www.odel.ueab.ac.ke

# Test auto-renewal
sudo certbot renew --dry-run
```

#### 7. Configure Firewall
```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw allow 10000/tcp  # Webmin

# Enable firewall
sudo ufw enable
sudo ufw status
```

### Webmin Configuration

1. **Login to Webmin**: https://your-server:10000

2. **Create Virtual Server**
   - Virtualmin → Create Virtual Server
   - Domain: odel.ueab.ac.ke
   - Create

3. **Configure Node.js**
   - Virtualmin → Server Configuration → Website Options
   - Enable Node.js support

4. **Set Environment Variables**
   - Virtualmin → Edit Virtual Server → Environment Variables
   - Add production variables

5. **Setup Monitoring**
   - Webmin → System → System and Server Status
   - Add monitors for:
     - Nginx service
     - PM2 process
     - Disk space
     - Memory usage

6. **Configure Backups**
   - Virtualmin → Backup and Restore
   - Schedule: Daily at 2:00 AM
   - Destinations: Local + Remote (S3/FTP)
   - Include: Home directory, Databases

## Option 3: DigitalOcean App Platform

1. **Create Account**: [digitalocean.com](https://digitalocean.com)

2. **Create App**
   - Apps → Create App
   - Connect GitHub repository
   - Select branch: main

3. **Configure Build**
   - Build Command: `npm run build`
   - Run Command: `npm start`

4. **Add Environment Variables**
   - Settings → Environment Variables
   - Add production variables

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment

**Pros**: Easy, managed, scalable
**Cons**: Monthly cost

## Post-Deployment Tasks

### 1. Verify Deployment
```bash
# Check if site is accessible
curl -I https://odel.ueab.ac.ke

# Check SSL certificate
openssl s_client -connect odel.ueab.ac.ke:443 -servername odel.ueab.ac.ke
```

### 2. Setup Monitoring
```bash
# Install monitoring tools
sudo apt-get install htop iotop

# Monitor PM2
pm2 monit

# View logs
pm2 logs ueab-odel
```

### 3. Configure Analytics
- Add Google Analytics
- Setup error tracking (Sentry)
- Configure uptime monitoring

### 4. Performance Testing
```bash
# Install testing tools
npm install -g lighthouse

# Run Lighthouse audit
lighthouse https://odel.ueab.ac.ke --view
```

### 5. Security Hardening
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade

# Configure fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban

# Setup automatic security updates
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Continuous Deployment

### Automated Updates with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/odel.ueab.ac.ke
            git pull origin main
            npm install
            npm run build
            pm2 restart ueab-odel
```

## Maintenance

### Regular Updates
```bash
# Update application
cd /var/www/odel.ueab.ac.ke
git pull origin main
npm install
npm run build
pm2 restart ueab-odel

# Update system packages
sudo apt-get update && sudo apt-get upgrade

# Update Node.js packages
npm update
```

### Backup and Restore
```bash
# Manual backup
pm2 save
tar -czf odel-backup-$(date +%Y%m%d).tar.gz /var/www/odel.ueab.ac.ke

# Restore from backup
tar -xzf odel-backup-YYYYMMDD.tar.gz -C /
cd /var/www/odel.ueab.ac.ke
npm install
pm2 restart ueab-odel
```

### Monitoring Commands
```bash
# Check application status
pm2 status

# View logs
pm2 logs ueab-odel --lines 100

# Monitor resources
pm2 monit

# Check Nginx status
sudo systemctl status nginx

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### Application won't start
```bash
# Check PM2 logs
pm2 logs ueab-odel --err

# Check Node.js version
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
pm2 restart ueab-odel
```

### Port conflicts
```bash
# Find process on port 3000
sudo lsof -i :3000

# Kill process
sudo kill -9 <PID>
```

### SSL certificate issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

### High memory usage
```bash
# Check memory
free -h

# Restart application
pm2 restart ueab-odel

# Clear cache
pm2 flush
```

## Support

For deployment assistance:
- **Email**: odel@ueab.ac.ke
- **Phone**: +254 714 333 111
- **Documentation**: See README.md

---

**Last Updated**: October 2025

