# Setup Guide for UEAB ODel eLearning Platform

## Prerequisites Installation

### Windows Installation

#### 1. Install Node.js

**Option A: Using Official Installer (Recommended)**

1. Visit [Node.js Official Website](https://nodejs.org/)
2. Download the **LTS version** (18.x or higher)
3. Run the installer
4. Follow the installation wizard:
   - Accept the license agreement
   - Choose installation location (default is fine)
   - **Important**: Check "Automatically install necessary tools"
   - Click Install

5. Verify installation:
   ```powershell
   node --version
   npm --version
   ```

**Option B: Using Chocolatey**

```powershell
# Install Chocolatey (if not installed)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs-lts -y

# Verify
node --version
npm --version
```

**Option C: Using Windows Package Manager (winget)**

```powershell
# Install Node.js
winget install OpenJS.NodeJS.LTS

# Verify
node --version
npm --version
```

#### 2. Install Git (if not already installed)

**Option A: Official Installer**
1. Visit [Git for Windows](https://git-scm.com/download/win)
2. Download and run installer
3. Use default settings

**Option B: Using Chocolatey**
```powershell
choco install git -y
```

**Option C: Using winget**
```powershell
winget install Git.Git
```

Verify installation:
```powershell
git --version
```

### Linux Installation

#### Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt-get install -y git

# Verify
node --version
npm --version
git --version
```

#### CentOS/RHEL

```bash
# Install Node.js 18.x
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Git
sudo yum install -y git

# Verify
node --version
npm --version
git --version
```

### macOS Installation

**Option A: Using Homebrew (Recommended)**

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@18

# Install Git
brew install git

# Verify
node --version
npm --version
git --version
```

**Option B: Using Official Installer**
1. Visit [Node.js Official Website](https://nodejs.org/)
2. Download macOS installer
3. Run and follow installation wizard

## Project Setup

### Step 1: Navigate to Project Directory

```powershell
# Windows PowerShell
cd "C:\Users\ODeL\Downloads\Documents\MISHAEL\ODel Website"
```

```bash
# Linux/macOS
cd ~/path/to/ODel\ Website
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- React Icons
- Framer Motion
- And all other dependencies

**Expected output:**
```
added XXX packages in XXs
```

### Step 3: Run Development Server

```bash
npm run dev
```

**Expected output:**
```
> ueab-odel-elearning@1.0.0 dev
> next dev

  ▲ Next.js 14.2.0
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in 2.5s
```

### Step 4: Open in Browser

Open your browser and navigate to:
- **Local**: http://localhost:3000
- **Network**: http://192.168.x.x:3000 (accessible from other devices on same network)

## Development Commands

### Start Development Server
```bash
npm run dev
```
- Starts development server with hot reload
- Access at http://localhost:3000

### Build for Production
```bash
npm run build
```
- Creates optimized production build
- Output in `.next` folder

### Start Production Server
```bash
npm start
```
- Runs production build
- Must run `npm run build` first

### Lint Code
```bash
npm run lint
```
- Checks for code quality issues
- Follows Next.js ESLint rules

## Troubleshooting

### Issue: "npm is not recognized"

**Solution**: Node.js is not installed or not in PATH

1. Install Node.js (see above)
2. Restart your terminal/PowerShell
3. If still not working, add to PATH manually:
   - Windows: Add `C:\Program Files\nodejs` to System PATH
   - Restart terminal

### Issue: "Port 3000 is already in use"

**Solution**: Another application is using port 3000

**Windows:**
```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

**Linux/macOS:**
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9
```

**Or use different port:**
```bash
# Start on port 3001
npm run dev -- -p 3001
```

### Issue: "Module not found" errors

**Solution**: Dependencies not installed properly

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

### Issue: "Permission denied" errors

**Windows:**
- Run PowerShell as Administrator

**Linux/macOS:**
```bash
# Fix permissions
sudo chown -R $USER:$USER .
```

### Issue: Build fails with TypeScript errors

**Solution**: Type checking issues

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Fix or temporarily skip (not recommended for production)
# In next.config.js, add:
# typescript: { ignoreBuildErrors: true }
```

### Issue: Styles not loading

**Solution**: Tailwind CSS not building properly

```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run dev
```

## Editor Setup (Recommended)

### Visual Studio Code

1. **Install VS Code**: https://code.visualstudio.com/

2. **Install Extensions**:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - TypeScript and JavaScript Language Features

3. **Open Project**:
   ```bash
   code .
   ```

4. **Configure Settings** (`.vscode/settings.json`):
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "tailwindCSS.experimental.classRegex": [
       ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
     ]
   }
   ```

### Other Editors

- **WebStorm**: Built-in support for Next.js and TypeScript
- **Sublime Text**: Install Package Control + relevant packages
- **Vim/Neovim**: Use CoC or native LSP

## Next Steps

After successful setup:

1. ✅ Explore the application at http://localhost:3000
2. ✅ Review the code structure in `README.md`
3. ✅ Make your first changes
4. ✅ Test responsiveness on different devices
5. ✅ Read `DEPLOYMENT.md` for production deployment

## Getting Help

### Documentation
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs

### UEAB ODel Support
- **Email**: odel@ueab.ac.ke
- **Phone**: +254 714 333 111

### Common Resources
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Tailwind UI Components](https://tailwindui.com/components)
- [React Icons](https://react-icons.github.io/react-icons/)

## Project Structure Quick Reference

```
ODel Website/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Homepage
│   ├── layout.tsx         # Root layout
│   ├── globals.css        # Global styles
│   ├── courses/           # Courses page
│   ├── dashboard/         # Student dashboard
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── about/             # About page
│   └── contact/           # Contact page
├── components/            # Reusable components
│   ├── Navbar.tsx        # Navigation
│   └── Footer.tsx        # Footer
├── public/               # Static files
├── package.json          # Dependencies
├── tailwind.config.js    # Tailwind config
└── tsconfig.json         # TypeScript config
```

## Development Workflow

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Edit files in `app/` or `components/`
   - Changes auto-reload in browser

3. **Test Changes**
   - Check in browser
   - Test on mobile (use Network URL)
   - Check console for errors

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

5. **Deploy**
   - See `DEPLOYMENT.md` for deployment options

---

**Happy Coding! 🚀**

