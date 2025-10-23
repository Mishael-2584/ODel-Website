# Webmin/Virtualmin + Netlify Setup for odel.ueab.ac.ke

## 🎯 **Complete Setup Guide**

### **1. DNS Configuration (Most Important!)**

#### **A. Add DNS Records in Webmin/Virtualmin**
```bash
# In Webmin → Servers → BIND DNS Server
# Or Virtualmin → DNS Settings

# Add these DNS records for odel.ueab.ac.ke:

# 1. CNAME Record (Points to Netlify)
CNAME   odel.ueab.ac.ke    →    your-netlify-site.netlify.app

# 2. CNAME Record for www subdomain
CNAME   www.odel.ueab.ac.ke    →    your-netlify-site.netlify.app

# 3. A Record (Alternative to CNAME)
A       odel.ueab.ac.ke    →    75.2.60.5 (Netlify's IP)

# 4. Mail Server Records (for SMTP)
A       mail.odel.ueab.ac.ke    →    YOUR_SERVER_IP
MX      odel.ueab.ac.ke         →    mail.odel.ueab.ac.ke (priority 10)
```

#### **B. Verify DNS Propagation**
```bash
# Check DNS propagation:
nslookup odel.ueab.ac.ke
dig odel.ueab.ac.ke

# Should resolve to Netlify's IP or CNAME
```

### **2. Netlify Configuration**

#### **A. Add Custom Domain in Netlify**
```bash
# In Netlify Dashboard:
1. Go to Site Settings → Domain Management
2. Add Custom Domain: odel.ueab.ac.ke
3. Add www subdomain: www.odel.ueab.ac.ke
4. Enable "Force HTTPS"
5. Enable "Redirect www to apex" (optional)
```

#### **B. Netlify Environment Variables**
Add these to Netlify → Site Settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://vsirtnqfvimtkgabxpzy.supabase.co
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

# SMTP Configuration (Your Webmin Server)
SMTP_HOST=mail.odel.ueab.ac.ke
SMTP_PORT=587
SMTP_USER=noreply@odel.ueab.ac.ke
SMTP_PASS=your_email_password_here
SMTP_SECURE=false
SMTP_FROM=noreply@odel.ueab.ac.ke

# Admin Configuration
ADMIN_EMAIL=admin@ueab.ac.ke
ADMIN_PASSWORD_HASH=$2b$10$NfOEZsGn/E753DWdSUN/weobXe0uHYY7HrehHHbAIDuXD/lFWIJoG
```

### **3. Webmin/Virtualmin Mail Server Setup**

#### **A. Configure Postfix for odel.ueab.ac.ke**
```bash
# In Webmin → Servers → Postfix Mail Server
# Or Virtualmin → Email Settings

# Main Settings:
Domain: odel.ueab.ac.ke
Mail Server: mail.odel.ueab.ac.ke
SMTP Port: 587 (TLS) or 465 (SSL)
Authentication: Required
SSL/TLS: Enabled
```

#### **B. Create Email Account**
```bash
# In Virtualmin → Create Mail User
Email: noreply@odel.ueab.ac.ke
Password: strong_password_here
Mailbox Size: 1GB
```

#### **C. Configure Firewall**
```bash
# Allow SMTP ports:
Port 25: SMTP (if needed)
Port 587: SMTP with TLS (recommended)
Port 465: SMTP with SSL (alternative)
```

### **4. SSL Certificate Setup**

#### **A. Netlify SSL (Automatic)**
```bash
# Netlify automatically provides SSL certificates
# Just enable "Force HTTPS" in domain settings
```

#### **B. Webmin SSL for Mail Server**
```bash
# In Webmin → Servers → Apache Web Server → SSL Certificates
# Or Virtualmin → SSL Settings

# Generate SSL certificate for mail.odel.ueab.ac.ke
# Or use Let's Encrypt for free SSL
```

### **5. Testing Your Setup**

#### **A. Test Domain Resolution**
```bash
# Test DNS resolution:
ping odel.ueab.ac.ke
# Should resolve to Netlify's IP

# Test website:
curl -I https://odel.ueab.ac.ke
# Should return 200 OK
```

#### **B. Test Email Functionality**
```bash
# Test SMTP connection:
telnet mail.odel.ueab.ac.ke 587
# Should connect successfully

# Test email sending from your app:
# Try the login flow to send magic code emails
```

#### **C. Test All Features**
```bash
# Test these features on odel.ueab.ac.ke:
1. ✅ Home page loads
2. ✅ Login with magic code
3. ✅ Email sending works
4. ✅ Chatbot integration
5. ✅ Admin panel access
6. ✅ News and Events
7. ✅ Programs catalog
```

### **6. Security Configuration**

#### **A. SPF Record**
```bash
# Add SPF record to prevent spam:
TXT   odel.ueab.ac.ke    "v=spf1 a mx include:mail.odel.ueab.ac.ke ~all"
```

#### **B. DKIM (Optional but Recommended)**
```bash
# In Webmin → Servers → Postfix Mail Server → DKIM
# Enable DKIM and add the public key to DNS
```

### **7. Monitoring and Maintenance**

#### **A. Check Logs**
```bash
# Netlify logs:
# Check Netlify dashboard → Functions → Logs

# Webmin mail logs:
tail -f /var/log/mail.log
tail -f /var/log/mail.err
```

#### **B. Monitor Performance**
```bash
# Check website performance:
# Use tools like GTmetrix, PageSpeed Insights

# Monitor email delivery:
# Check mail server logs for delivery status
```

### **8. Troubleshooting**

#### **Common Issues:**

1. **Domain Not Resolving**
   - Check DNS records in Webmin
   - Wait for DNS propagation (up to 48 hours)
   - Verify CNAME/A record is correct

2. **SSL Certificate Issues**
   - Enable "Force HTTPS" in Netlify
   - Check SSL certificate validity
   - Clear browser cache

3. **Email Not Working**
   - Check SMTP credentials in Netlify
   - Verify firewall allows port 587/465
   - Check mail server logs

4. **App Features Not Working**
   - Verify all environment variables in Netlify
   - Check Netlify function logs
   - Test API endpoints individually

### **9. Final Checklist**

- [ ] DNS records added in Webmin
- [ ] Custom domain added in Netlify
- [ ] Environment variables set in Netlify
- [ ] Mail server configured in Webmin
- [ ] SSL certificates working
- [ ] Email functionality tested
- [ ] All app features working
- [ ] Security records (SPF) added

## 🚀 **Your Setup is Complete!**

Once all steps are completed, your app will be accessible at:
- **https://odel.ueab.ac.ke** (main site)
- **https://www.odel.ueab.ac.ke** (www subdomain)

And email will be sent from:
- **noreply@odel.ueab.ac.ke**

## 📞 **Need Help?**

If you encounter any issues:
1. Check the troubleshooting section
2. Verify DNS propagation
3. Check Netlify function logs
4. Check Webmin mail server logs
