# UEAB ODel - eLearning Platform

![UEAB ODel](https://img.shields.io/badge/UEAB-ODel%20eLearning-1e40af)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)

A modern, fully-functional e-learning platform for the University of Eastern Africa, Baraton (UEAB). Built with Next.js, React, TypeScript, and Tailwind CSS, featuring UEAB's official branding and colors.

## 🎓 Features

- **Modern UI/UX**: Beautiful, responsive design with UEAB's blue and gold color scheme
- **Course Management**: Browse, search, and filter courses by category and level
- **Student Dashboard**: Track progress, view enrolled courses, and manage learning activities
- **Authentication**: Secure login and registration with social auth integration
- **Progress Tracking**: Visual progress indicators and achievement system
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: WCAG compliant with semantic HTML and ARIA labels
- **Performance**: Optimized with Next.js 14 App Router and server components

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, or pnpm package manager
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd "ODel Website"
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
ODel Website/
├── app/                      # Next.js 14 App Router
│   ├── layout.tsx           # Root layout with fonts and metadata
│   ├── page.tsx             # Homepage with hero and features
│   ├── globals.css          # Global styles and Tailwind
│   ├── about/               # About page
│   ├── contact/             # Contact page
│   ├── courses/             # Course catalog
│   ├── dashboard/           # Student dashboard
│   ├── login/               # Login page
│   └── register/            # Registration page
├── components/              # Reusable React components
│   ├── Navbar.tsx          # Navigation bar
│   └── Footer.tsx          # Footer component
├── public/                  # Static assets
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## 🎨 Design System

### Colors

- **Primary Blue**: `#1e40af` - UEAB official blue
- **Gold**: `#eab308` - UEAB official gold
- **Gradients**: Primary and gold gradients throughout

### Typography

- **Headings**: Poppins font family
- **Body**: Inter font family

### Components

- Buttons: Primary, Secondary, and Outline variants
- Cards: Hover effects with shadow transitions
- Forms: Consistent input styling with focus states
- Navigation: Sticky header with mobile menu

## 🌐 Pages Overview

### Homepage (`/`)
- Hero section with call-to-action
- Statistics showcase
- Feature highlights
- Popular courses grid
- CTA section

### Courses (`/courses`)
- Search and filter functionality
- Course cards with details
- Category and level filters
- Responsive grid layout

### Dashboard (`/dashboard`)
- Enrolled courses with progress
- Statistics cards
- Upcoming deadlines
- Recent activity feed
- Achievements showcase

### Authentication
- **Login** (`/login`): Email/password with social auth
- **Register** (`/register`): Multi-step registration form

### Static Pages
- **About** (`/about`): Mission, vision, values, and history
- **Contact** (`/contact`): Contact form and information

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=UEAB ODel

# API Configuration (add when backend is ready)
NEXT_PUBLIC_API_URL=https://api.ueab.ac.ke
API_SECRET_KEY=your-secret-key

# Database (add when needed)
DATABASE_URL=postgresql://user:password@localhost:5432/ueab_odel

# Authentication (add when implementing)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

# Email (add when implementing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@ueab.ac.ke
SMTP_PASSWORD=your-password
```

## 🖥️ Deployment

### Build for Production

```bash
npm run build
npm start
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

### Deploy to Other Platforms

- **Netlify**: Connect GitHub repo and deploy
- **AWS Amplify**: Use AWS console or CLI
- **DigitalOcean App Platform**: Connect repo and deploy
- **Self-hosted**: See Webmin/Virtualmin section below

## 🐧 Webmin/Virtualmin Integration

### Prerequisites

- Ubuntu/Debian/CentOS server
- Webmin/Virtualmin installed
- Node.js 18+ installed
- Nginx or Apache web server
- Domain name configured

### Step 1: Install Node.js on Server

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### Step 2: Install PM2 Process Manager

```bash
# Install PM2 globally
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### Step 3: Deploy Application

```bash
# Navigate to your web directory
cd /home/username/public_html

# Clone your repository
git clone <your-repo-url> odel
cd odel

# Install dependencies
npm install

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "ueab-odel" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 4: Configure Nginx Reverse Proxy

Create a new file: `/etc/nginx/sites-available/odel.ueab.ac.ke`

```nginx
server {
    listen 80;
    server_name odel.ueab.ac.ke www.odel.ueab.ac.ke;

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
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/odel.ueab.ac.ke /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Configure SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d odel.ueab.ac.ke -d www.odel.ueab.ac.ke

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

### Step 6: Webmin/Virtualmin Configuration

1. **Login to Webmin** (https://your-server:10000)

2. **Create Virtual Server** (if not exists)
   - Virtualmin → Create Virtual Server
   - Domain name: `odel.ueab.ac.ke`
   - Administration username: `odel`
   - Create home directory

3. **Configure Node.js Application**
   - Virtualmin → Edit Virtual Server → Enabled Features
   - Enable "Node.js application"
   - Set Node.js version to 18.x

4. **Set Environment Variables**
   - Virtualmin → Edit Virtual Server → Environment Variables
   - Add your production environment variables

5. **Configure Firewall**
   - Webmin → Networking → Linux Firewall
   - Allow ports: 80 (HTTP), 443 (HTTPS), 3000 (Node.js)

6. **Setup Backup**
   - Virtualmin → Backup and Restore
   - Schedule daily backups
   - Include: Home directory, Databases, Configuration files

### Step 7: Monitoring and Maintenance

```bash
# View application logs
pm2 logs ueab-odel

# Monitor application
pm2 monit

# Restart application
pm2 restart ueab-odel

# Stop application
pm2 stop ueab-odel

# View application status
pm2 status
```

### Step 8: Update Deployment

```bash
# Navigate to application directory
cd /home/username/public_html/odel

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Rebuild application
npm run build

# Restart with PM2
pm2 restart ueab-odel
```

### Troubleshooting

**Port 3000 already in use:**
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
sudo kill -9 <PID>
```

**Permission issues:**
```bash
# Fix ownership
sudo chown -R username:username /home/username/public_html/odel

# Fix permissions
chmod -R 755 /home/username/public_html/odel
```

**Application won't start:**
```bash
# Check PM2 logs
pm2 logs ueab-odel --lines 100

# Check Node.js version
node --version

# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

## 📊 Performance Optimization

- **Image Optimization**: Use Next.js Image component
- **Code Splitting**: Automatic with Next.js App Router
- **Caching**: Configure in `next.config.js`
- **CDN**: Use Vercel Edge Network or Cloudflare

## 🔒 Security Best Practices

- Keep dependencies updated: `npm audit`
- Use environment variables for secrets
- Implement rate limiting for API routes
- Enable CORS properly
- Use HTTPS in production
- Sanitize user inputs
- Implement CSRF protection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

© 2025 University of Eastern Africa, Baraton. All Rights Reserved.

## 📞 Support

- **Email**: odel@ueab.ac.ke
- **Phone**: +254 714 333 111
- **Website**: https://ueab.ac.ke

## 🙏 Acknowledgments

- UEAB Administration and Faculty
- ODel Department
- All contributors and students

---

**Built with ❤️ for UEAB by the ODel Development Team**

