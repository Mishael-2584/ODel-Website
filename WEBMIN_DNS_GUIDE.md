# Webmin DNS Setup for odel.ueab.ac.ke

## 🎯 **Step-by-Step Webmin DNS Configuration**

### **1. Access DNS Management**
```
Webmin → Servers → BIND DNS Server
OR
Virtualmin → DNS Settings
```

### **2. Add DNS Records**

#### **Record 1: Name Alias (Main Domain)**
```
Type: Name Alias
Name: odel.ueab.ac.ke
Value: your-netlify-site.netlify.app
```

#### **Record 2: Name Alias (WWW Subdomain)**
```
Type: Name Alias  
Name: www.odel.ueab.ac.ke
Value: your-netlify-site.netlify.app
```

#### **Record 3: Address (Mail Server)**
```
Type: Address
Name: mail.odel.ueab.ac.ke
Value: YOUR_SERVER_IP_ADDRESS
```

#### **Record 4: Mail Server (MX Record)**
```
Type: Mail Server
Name: odel.ueab.ac.ke
Value: mail.odel.ueab.ac.ke
Priority: 10
```

### **3. What You Should See After Adding:**

```
Type                Records
Address             8        (was 7, now +1 for mail server)
Name Server        1
Name Alias         2        (was 0, now +2 for domain and www)
Mail Server        2        (was 1, now +1 for MX record)
Host Information   0
Text               2
Sender Permitted From 1
DMARC              0
Well Known Service 0
Responsible Person 0
Reverse Address    0
Location           0
Service Address    0
Public Key         0
SSL Certificate    0
SSH Public Key     0
Certificate Authority 1
Name Authority     0
DNSSEC Parameters  0
IPv6 Address       0
All                16       (was 13, now +3 new records)
```

### **4. Important Notes:**

✅ **Name Alias = CNAME** in Webmin terminology  
✅ **Address = A Record** in Webmin terminology  
✅ **Mail Server = MX Record** in Webmin terminology  

### **5. After Adding Records:**

1. **Save/Apply** the DNS changes
2. **Wait 15-60 minutes** for DNS propagation
3. **Test with**: `nslookup odel.ueab.ac.ke`
4. **Check in Netlify** that the domain is verified

### **6. Troubleshooting:**

- If Name Alias doesn't work, try Address record instead
- Make sure you have the correct Netlify site URL
- Check that your server IP is correct for mail server
- Wait for DNS propagation (can take up to 48 hours)

## 🚀 **You're All Set!**

Once these records are added and propagated, your domain `odel.ueab.ac.ke` will point to your Netlify site!
