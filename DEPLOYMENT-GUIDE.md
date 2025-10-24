# 🚀 Deployment Guide for UEAB ODel Application

## 📋 Current Setup
- **Repository**: GitHub (Mishael-2584/ODel-Website)
- **Production Server**: odel.ueab.ac.ke (Webmin/Virtualmin)
- **Application**: Next.js running on port 3000
- **Proxy**: Apache proxying requests to Node.js app

## 🔄 Update Methods

### Method 1: Enhanced Manual Updates (Recommended)
```bash
# Navigate to your app directory
cd /home/odel/public_html

# Run the enhanced update script
./update.sh
```

This enhanced script will:
- ✅ Pull latest changes from GitHub
- ✅ Install new dependencies if needed
- ✅ Clear Next.js cache to prevent build issues
- ✅ Build the application for production
- ✅ Stop existing application gracefully
- ✅ Ensure port 3000 is free
- ✅ Restart the application automatically
- ✅ Verify the application is running
- ✅ Log all operations for troubleshooting

### Method 2: Step-by-Step Manual Process
```bash
# 1. Pull latest changes
git pull origin master

# 2. Install dependencies (if package.json changed)
npm install

# 3. Build for production
npm run build

# 4. Restart application
pkill -f "next start"
PORT=3000 npm start &
```

### Method 3: GitHub Webhooks (Advanced)
For automatic updates when you push to GitHub:

1. **Create a webhook endpoint** (requires additional server setup)
2. **Configure GitHub webhook** to call your server
3. **Use the webhook-update.sh script** for automatic deployments

## 🔧 Useful Commands

### Check Application Status
```bash
# Quick status check (recommended)
./check-status.sh

# Check if app is running
ps aux | grep "next start"

# Check application logs
tail -f app.log

# Check update logs
tail -f update.log
```

### Git Operations
```bash
# Check git status
git status

# See recent commits
git log --oneline -5

# Check if behind remote
git fetch && git status
```

### Application Management
```bash
# Stop application
pkill -f "next start"

# Start application
cd /home/odel/public_html && PORT=3000 npm start &

# Restart application
pkill -f "next start" && sleep 2 && cd /home/odel/public_html && PORT=3000 npm start &
```

## 📁 Important Files

- `update.sh` - Manual update script
- `webhook-update.sh` - Automatic update script
- `start-production.sh` - Start application in production
- `apache-proxy-config.conf` - Apache proxy configuration
- `update.log` - Update process logs

## ⚠️ Important Notes

1. **Always test locally** before pushing to production
2. **Check logs** after updates for any errors
3. **Backup database** before major updates
4. **Monitor application** after deployment
5. **Keep dependencies updated** regularly

## 🔍 Troubleshooting

### Application Won't Start
```bash
# Check for port conflicts
netstat -tulpn | grep :3000

# Check Node.js version
node --version

# Check npm version
npm --version
```

### Git Issues
```bash
# Reset to clean state
git reset --hard HEAD

# Pull with force
git fetch origin
git reset --hard origin/master
```

### Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📞 Support
If you encounter issues:
1. Check the update logs: `tail -f /home/odel/public_html/update.log`
2. Check application status: `ps aux | grep "next start"`
3. Verify Apache proxy is working: Visit https://odel.ueab.ac.ke
