# UEAB ODel - Supabase Connection Helper
Write-Host "🔗 Connecting to Supabase Project" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`n📋 Your Project Details:" -ForegroundColor Yellow
Write-Host "   Project ID: vsirtnqfvimtkgabxpzy" -ForegroundColor White
Write-Host "   Database Password: Odel@2025!" -ForegroundColor White
Write-Host "   Project URL: https://vsirtnqfvimtkgabxpzy.supabase.co" -ForegroundColor White

Write-Host "`n🔑 Step 1: Get Access Token" -ForegroundColor Green
Write-Host "   The browser should have opened to:" -ForegroundColor Gray
Write-Host "   https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "`n   Instructions:" -ForegroundColor Yellow
Write-Host "   1. Login to your Supabase account" -ForegroundColor White
Write-Host "   2. Click 'Generate new token'" -ForegroundColor White
Write-Host "   3. Give it a name like 'UEAB ODel CLI'" -ForegroundColor White
Write-Host "   4. Copy the token (it starts with 'sbp_')" -ForegroundColor White

Write-Host "`n⏸️  PAUSE HERE" -ForegroundColor Red
Write-Host "   Get your access token first, then press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "`n🔑 Step 2: Enter Access Token" -ForegroundColor Green
$accessToken = Read-Host "   Paste your access token (sbp_...)"

if ($accessToken -like "sbp_*") {
    Write-Host "`n✅ Token looks valid! Setting up connection..." -ForegroundColor Green
    
    # Set environment variable for this session
    $env:SUPABASE_ACCESS_TOKEN = $accessToken
    
    Write-Host "`n🔗 Linking to project..." -ForegroundColor Yellow
    npx supabase link --project-ref vsirtnqfvimtkgabxpzy --password "Odel@2025!"
    
    Write-Host "`n📊 Testing connection..." -ForegroundColor Yellow
    npx supabase projects list
    
    Write-Host "`n🎉 Connection Test Complete!" -ForegroundColor Green
    Write-Host "   If you see your project listed above, you're connected!" -ForegroundColor White
    
    Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Run: npx supabase db pull" -ForegroundColor White
    Write-Host "   2. Run: npx supabase db push" -ForegroundColor White
    Write-Host "   3. Check your database at:" -ForegroundColor White
    Write-Host "      https://supabase.com/dashboard/project/vsirtnqfvimtkgabxpzy" -ForegroundColor White
    
} else {
    Write-Host "`n❌ Invalid token format!" -ForegroundColor Red
    Write-Host "   Token should start with 'sbp_'" -ForegroundColor Yellow
    Write-Host "   Please try again..." -ForegroundColor White
}

Write-Host "`n" + "="*60 -ForegroundColor Cyan
