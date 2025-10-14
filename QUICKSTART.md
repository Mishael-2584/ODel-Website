# 🚀 Quick Start Guide - UEAB ODel eLearning Platform

## ⚡ Get Started in 5 Minutes

### Step 1: Install Node.js (if not installed)

**Windows:**
1. Download from https://nodejs.org/ (LTS version)
2. Run installer and follow prompts
3. Restart your terminal

**Verify installation:**
```powershell
node --version
npm --version
```

### Step 2: Install Dependencies

```bash
npm install
```

⏱️ This takes 2-3 minutes on first install.

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Open in Browser

Navigate to: **http://localhost:3000**

🎉 **You're done!** The website is now running locally.

---

## 📱 What You'll See

### Homepage
- Beautiful hero section with UEAB branding
- Statistics showcase
- Feature highlights
- Popular courses
- Call-to-action sections

### Available Pages
- **/** - Homepage
- **/courses** - Course catalog with search/filter
- **/dashboard** - Student dashboard
- **/login** - Login page
- **/register** - Registration page
- **/about** - About UEAB ODel
- **/contact** - Contact form

---

## 🎨 Features

✅ **Modern Design** - Clean, professional UI with UEAB colors (blue & gold)
✅ **Fully Responsive** - Works on desktop, tablet, and mobile
✅ **Interactive** - Hover effects, animations, smooth transitions
✅ **Search & Filter** - Find courses by category, level, keywords
✅ **Progress Tracking** - Visual progress bars and statistics
✅ **Authentication UI** - Login and registration pages
✅ **Dashboard** - Student learning dashboard with activities

---

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build for production |
| `npm start` | Run production build |
| `npm run lint` | Check code quality |

---

## 📂 Project Structure

```
ODel Website/
├── app/                    # Pages and routes
│   ├── page.tsx           # Homepage
│   ├── courses/           # Course catalog
│   ├── dashboard/         # Student dashboard
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # Reusable components
│   ├── Navbar.tsx        # Navigation bar
│   └── Footer.tsx        # Footer
└── public/               # Static files
```

---

## 🎯 Next Steps

### For Development:
1. ✅ Explore the pages at http://localhost:3000
2. ✅ Edit files in `app/` folder - changes auto-reload!
3. ✅ Customize colors in `tailwind.config.js`
4. ✅ Add your content and images

### For Production:
1. ✅ Read `DEPLOYMENT.md` for deployment options
2. ✅ Configure environment variables
3. ✅ Build and deploy to your server

---

## 🌟 Key Technologies

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **Framer Motion** - Animation library

---

## 🎨 UEAB Branding

### Colors Used:
- **Primary Blue**: `#1e40af` (UEAB official blue)
- **Gold**: `#eab308` (UEAB official gold)
- **Gradients**: Blue to dark blue, gold gradients

### Fonts:
- **Headings**: Poppins (bold, modern)
- **Body**: Inter (clean, readable)

---

## 📱 Test on Mobile

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac
   ifconfig
   ```

2. On your phone, navigate to:
   ```
   http://YOUR-IP-ADDRESS:3000
   ```

Example: `http://192.168.1.100:3000`

---

## 🔧 Troubleshooting

### "npm is not recognized"
➡️ **Solution**: Install Node.js (see Step 1)

### "Port 3000 already in use"
➡️ **Solution**: 
```bash
# Use different port
npm run dev -- -p 3001
```

### "Module not found"
➡️ **Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Need more help?
📖 See `SETUP.md` for detailed troubleshooting

---

## 📞 Support

- **Email**: odel@ueab.ac.ke
- **Phone**: +254 714 333 111
- **Website**: https://ueab.ac.ke

---

## 📚 Documentation

- **Full Setup Guide**: See `SETUP.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Project Details**: See `README.md`

---

## ✨ What's Included

### Pages (8 total):
✅ Homepage with hero and features
✅ Course catalog with search/filter
✅ Student dashboard with progress tracking
✅ Login page with social auth UI
✅ Registration page with validation
✅ About page with mission/vision
✅ Contact page with form
✅ Responsive navigation and footer

### Components:
✅ Reusable Navbar with mobile menu
✅ Footer with links and contact info
✅ Cards, buttons, forms
✅ Progress bars and statistics
✅ Icons and animations

### Features:
✅ Responsive design (mobile, tablet, desktop)
✅ Modern UI with UEAB branding
✅ Interactive elements and animations
✅ Search and filter functionality
✅ Progress tracking visualizations
✅ Accessibility features

---

## 🚀 Ready to Deploy?

### Option 1: Vercel (Easiest)
1. Push to GitHub
2. Import to Vercel
3. Deploy (automatic)

### Option 2: Your Own Server
1. See `DEPLOYMENT.md`
2. Follow Webmin/Virtualmin guide
3. Deploy with PM2 and Nginx

---

**🎓 Built for UEAB ODel - Empowering Education Through Technology**

**© 2025 University of Eastern Africa, Baraton. All Rights Reserved.**

