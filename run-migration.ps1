# UEAB ODel - Run Database Migration
# This script executes the SQL migration directly in Supabase

Write-Host "🚀 UEAB ODel Database Migration" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Load environment variables
$envContent = Get-Content .env.local
$supabaseUrl = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_URL=(.+)").Matches.Groups[1].Value
$supabaseKey = ($envContent | Select-String "NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)").Matches.Groups[1].Value

if (-not $supabaseUrl -or -not $supabaseKey) {
    Write-Host "❌ Error: Could not read Supabase credentials from .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Reading migration SQL file..." -ForegroundColor Yellow
$migrationSQL = Get-Content "supabase\migrations\20250114000000_initial_schema.sql" -Raw

Write-Host "📊 Migration contains:" -ForegroundColor Green
Write-Host "   ✓ 12 database tables" -ForegroundColor Gray
Write-Host "   ✓ Row-level security policies" -ForegroundColor Gray  
Write-Host "   ✓ Triggers and functions" -ForegroundColor Gray
Write-Host "   ✓ Indexes for performance`n" -ForegroundColor Gray

# Unfortunately, we can't execute DDL via the REST API
# We need to guide the user to run it manually

Write-Host "⚠️  Important Note:" -ForegroundColor Yellow
Write-Host "   SQL migrations require admin access and cannot be executed via REST API`n" -ForegroundColor Gray

Write-Host "✅ Solution: Run migration via Supabase Dashboard`n" -ForegroundColor Green

Write-Host "📝 Steps to Complete:" -ForegroundColor Cyan
Write-Host "   1. Open: https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql" -ForegroundColor White
Write-Host "   2. Click 'New query'" -ForegroundColor White
Write-Host "   3. The migration SQL is in: supabase\migrations\20250114000000_initial_schema.sql" -ForegroundColor White
Write-Host "   4. Copy ALL content from that file" -ForegroundColor White
Write-Host "   5. Paste in SQL Editor and click RUN`n" -ForegroundColor White

Write-Host "💡 Quick Copy Command:" -ForegroundColor Yellow
Write-Host "   Get-Content 'supabase\migrations\20250114000000_initial_schema.sql' | Set-Clipboard" -ForegroundColor Cyan
Write-Host "   (This copies the SQL to your clipboard!)`n" -ForegroundColor Gray

# Copy to clipboard and open browser
Write-Host "📋 Copying SQL to clipboard..." -ForegroundColor Yellow
$migrationSQL | Set-Clipboard
Write-Host "✅ SQL copied to clipboard!`n" -ForegroundColor Green

Write-Host "🌐 Opening Supabase SQL Editor..." -ForegroundColor Yellow
Start-Process "https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy/sql"
Write-Host "✅ Browser opened!`n" -ForegroundColor Green

Write-Host "👉 Now in the browser:" -ForegroundColor Cyan
Write-Host "   1. Click 'New query'" -ForegroundColor White
Write-Host "   2. Press Ctrl+V to paste" -ForegroundColor White
Write-Host "   3. Click the green RUN button`n" -ForegroundColor White

Write-Host "`n📞 After running the migration, your database will be ready!" -ForegroundColor Green
Write-Host "   Then run: npm run dev" -ForegroundColor White
Write-Host "   And login at: http://localhost:3000/login`n" -ForegroundColor White

