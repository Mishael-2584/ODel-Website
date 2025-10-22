# Authentication Flow Documentation

## 🎓 Two Separate Login Flows

The ODeL platform now has **two distinct authentication methods**:

### 1. **Student Login** (`/login`)
**Passwordless Magic Code Authentication**

```
Flow:
┌─────────────────────────────────────────┐
│ Student enters UEAB email               │
│ student@ueab.ac.ke                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ System sends 6-digit code to email      │
│ Email: "Your login code: 123456"        │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Student enters code on verification page│
│ Code expires in 10 minutes              │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ ✅ Student Dashboard Access             │
│ Full Moodle Integration                 │
└─────────────────────────────────────────┘
```

**URL**: `http://localhost:3000/login`

**Features**:
- ✅ No password required
- ✅ Code-based verification (more secure for mass users)
- ✅ Email-based identity confirmation
- ✅ 10-minute code expiry
- ✅ Beautiful branded email template
- ✅ Direct Moodle SSO integration

**Page Flow**:
1. **Step 1**: Email input field
   - Input: student@ueab.ac.ke
   - Button: "Send Code"
   - Success: "Code sent! Check your email"
   
2. **Step 2**: 6-digit code verification
   - Input: 6 digit code (numeric only)
   - Button: "Verify Code"
   - Back: Return to email step
   - Success: Redirect to `/student/dashboard`

---

### 2. **Admin Login** (`/admin/login`)
**Traditional Email + Password Authentication**

```
Flow:
┌─────────────────────────────────────────┐
│ Admin enters credentials                │
│ Email: admin@ueab.ac.ke                 │
│ Password: ••••••••                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ Credentials verified against database   │
│ Password: bcrypt hashed comparison      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ ✅ Admin Dashboard Access               │
│ Website Management & Analytics          │
└─────────────────────────────────────────┘
```

**URL**: `http://localhost:3000/admin/login`

**Features**:
- ✅ Email + Password authentication
- ✅ Bcrypt password hashing
- ✅ Remember me checkbox
- ✅ Access to admin dashboard
- ✅ User management capabilities
- ✅ Audit logs

**Page Features**:
- Admin Portal branding
- Email input with validation
- Password input with mask
- Remember me checkbox
- Student login link for easy switching

---

## 📊 Comparison Table

| Feature | Student Login | Admin Login |
|---------|---------------|------------|
| **URL** | `/login` | `/admin/login` |
| **Auth Method** | Magic Code (email) | Email + Password |
| **Code Expiry** | 10 minutes | N/A |
| **Moodle Integration** | ✅ SSO access | ❌ Admin only |
| **Dashboard** | `/student/dashboard` | `/admin/dashboard` |
| **Use Case** | Students accessing courses | Staff managing website |
| **Password Required** | ❌ No | ✅ Yes |

---

## 🔐 Security Features

### Student Login (Magic Code)
1. **Email Verification**
   - Confirms user owns the email address
   - Code only sent to registered email

2. **Time-Limited Codes**
   - 6-digit codes expire in 10 minutes
   - One-time use only
   - Regenerate if expired

3. **Brute Force Protection**
   - Rate limiting on code attempts
   - Max attempts: 3 per code
   - Lockout: Temporary after max attempts

### Admin Login (Password)
1. **Password Hashing**
   - Bcrypt with salt rounds: 10
   - Passwords never stored in plain text

2. **Session Management**
   - JWT tokens with 24-hour expiry
   - Secure HTTP-only cookies

3. **Audit Trail**
   - All admin actions logged
   - Failed login attempts tracked

---

## 📧 Email Template (Student Magic Code)

**Subject**: `Your UEAB ODeL Login Code: 123456`

**Body** (HTML with branding):
```
Logo: UEAB ODeL Header
Title: "Your Login Code"

Content:
- Big centered 6-digit code
- "This code expires in 10 minutes"
- "Don't share with anyone"
- Security note
- Contact support link

Branding:
- UEAB blue gradient header
- Professional styling
- Footer with copyright
```

---

## 🔗 Navigation Links

### From Student Login
- **Admin Login**: Link at bottom (Administrator?)
- **Home**: Logo link at top

### From Admin Login
- **Student Login**: "Student Login" button at bottom
- **Home**: Logo link at top

### From Student Dashboard
- **Moodle**: "Open Moodle" button (SSO)
- **Logout**: Logout button

### From Admin Dashboard
- **Manage Users**: User management section
- **Audit Logs**: View system activity
- **Logout**: Logout button

---

## 🛠️ Technical Implementation

### Student Login API Endpoints

**1. Send Code**
```
POST /api/auth/send-code
Body: { email: "student@ueab.ac.ke" }
Response: { success: true, message: "Code sent" }
```

**2. Verify Code**
```
POST /api/auth/verify-code
Body: { email: "student@ueab.ac.ke", code: "123456" }
Response: { success: true, token: "JWT_TOKEN" }
```

### Admin Login API Endpoint

```
POST /api/admin/login
Body: { email: "admin@ueab.ac.ke", password: "password123" }
Response: { success: true, token: "JWT_TOKEN" }
```

---

## 📝 User Journey Examples

### Example 1: New Student First Login
1. Visit `http://localhost:3000/login`
2. Enter: `harrietsa@ueab.ac.ke`
3. Click: "Send Code"
4. Check email for code: `234567`
5. Enter code on page
6. Click: "Verify Code"
7. **Result**: Redirected to dashboard
8. Can now:
   - View enrolled courses
   - See calendar events
   - Check assignments
   - View grades
   - Open Moodle with SSO

### Example 2: Admin Managing Website
1. Visit `http://localhost:3000/admin/login`
2. Enter: `admin@ueab.ac.ke`
3. Enter password
4. Click: "Sign In"
5. **Result**: Admin dashboard
6. Can now:
   - Manage users
   - View analytics
   - Configure settings
   - Access audit logs

---

## ✅ Troubleshooting

### Student Not Receiving Code
- [ ] Check email is correct (UEAB email only)
- [ ] Check spam/junk folder
- [ ] Verify email service configured (Supabase/SendGrid/Brevo)
- [ ] Check server logs for sending errors

### Code Expired
- [ ] Codes expire after 10 minutes
- [ ] Request new code
- [ ] Return to email step (click "Back")

### Admin Can't Login
- [ ] Verify email is admin email
- [ ] Check password is correct
- [ ] Ensure admin account exists in database
- [ ] Check password is bcrypt hashed

### Still Can't Login?
Check server logs at:
```
http://localhost:3000
Terminal output: npm run dev
```

---

## 🚀 Next Steps

1. ✅ Student login flow (magic code) - **DONE**
2. ✅ Admin login flow (password) - **DONE**
3. ⏳ Email template customization in Supabase
4. ⏳ Protected routes middleware
5. ⏳ Admin dashboard functionality
6. ⏳ User management panel

---
