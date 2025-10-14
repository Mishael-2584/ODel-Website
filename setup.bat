@echo off
echo ============================================
echo UEAB ODel - Automated Setup
echo ============================================
echo.
echo This will:
echo 1. Install dependencies
echo 2. Create admin account
echo 3. Guide you through database setup
echo.
echo Press any key to continue...
pause > nul

echo.
echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Installing dotenv for scripts...
call npm install --save-dev dotenv

echo.
echo Step 3: Running database setup...
node scripts/setup-database.js

echo.
echo ============================================
echo Setup Complete!
echo ============================================
echo.
echo IMPORTANT: You still need to run the migration manually!
echo.
echo 1. Go to: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql
echo 2. Click "New query"
echo 3. Open file: supabase/migrations/20250114000000_initial_schema.sql
echo 4. Copy ALL content and paste in SQL Editor
echo 5. Click RUN
echo.
echo Then start your dev server:
echo   npm run dev
echo.
echo Login with:
echo   Email: instructionaldesigner@ueab.ac.ke
echo   Password: Odel@2025!
echo.
pause

