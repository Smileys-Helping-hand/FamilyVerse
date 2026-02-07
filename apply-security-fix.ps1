# 🛡️ Security Fix Database Update Script
# This script helps you apply the critical security fix to your database

Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   🛡️  PARTY OS SECURITY FIX - DATABASE UPDATE" -ForegroundColor Yellow
Write-Host "══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "❌ ERROR: .env.local file not found!" -ForegroundColor Red
    Write-Host "Please make sure you have DATABASE_URL configured." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env.local" -ForegroundColor Green
Write-Host ""

# Load environment variables
Get-Content .env.local | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}

$DATABASE_URL = $env:DATABASE_URL

if (-not $DATABASE_URL) {
    Write-Host "❌ ERROR: DATABASE_URL not found in .env.local!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Database connection configured" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Option menu
Write-Host "Choose an option:" -ForegroundColor Yellow
Write-Host "  [1] 🚀 Push Schema Changes (Automated)" -ForegroundColor White
Write-Host "  [2] 📊 Open Drizzle Studio (Manual Update)" -ForegroundColor White
Write-Host "  [3] 📋 Show SQL Migration Script" -ForegroundColor White
Write-Host "  [4] ❌ Cancel" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Pushing schema changes to database..." -ForegroundColor Cyan
        Write-Host ""
        
        # Run drizzle-kit push
        npm run db:push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Schema updated successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "⚠️  IMPORTANT: You still need to manually update your admin PIN!" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Run: npm run db:studio" -ForegroundColor White
            Write-Host "  2. Go to 'party_users' table" -ForegroundColor White
            Write-Host "  3. Find your user (Mohammed Parker)" -ForegroundColor White
            Write-Host "  4. Change pin_code from '1696' to '2026' (or your secret PIN)" -ForegroundColor White
            Write-Host "  5. Set role to 'admin'" -ForegroundColor White
            Write-Host ""
            Write-Host "  OR use this SQL in Neon Console:" -ForegroundColor White
            Write-Host "  UPDATE party_users SET pin_code = '2026', role = 'admin' WHERE name = 'Mohammed Parker';" -ForegroundColor Gray
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "❌ Error pushing schema changes" -ForegroundColor Red
            Write-Host "Try option 2 (Drizzle Studio) for manual updates" -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "📊 Opening Drizzle Studio..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Instructions:" -ForegroundColor Yellow
        Write-Host "  1. Wait for Studio to open in your browser" -ForegroundColor White
        Write-Host "  2. Go to 'party_users' table" -ForegroundColor White
        Write-Host "  3. Find Mohammed Parker" -ForegroundColor White
        Write-Host "  4. Update pin_code to '2026' and role to 'admin'" -ForegroundColor White
        Write-Host "  5. Go to 'parties' table" -ForegroundColor White
        Write-Host "  6. Make sure a party exists with join_code = '1696'" -ForegroundColor White
        Write-Host ""
        
        npm run db:studio
    }
    
    "3" {
        Write-Host ""
        Write-Host "📋 SQL Migration Script" -ForegroundColor Cyan
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host ""
        
        $sqlFile = "drizzle\party-security-fix-migration.sql"
        if (Test-Path $sqlFile) {
            Get-Content $sqlFile | Write-Host -ForegroundColor White
        } else {
            Write-Host "❌ Migration file not found: $sqlFile" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host ""
        Write-Host "💡 Copy this SQL and run it in Neon Console:" -ForegroundColor Yellow
        Write-Host "   https://console.neon.tech" -ForegroundColor Cyan
        Write-Host ""
    }
    
    "4" {
        Write-Host ""
        Write-Host "❌ Cancelled" -ForegroundColor Yellow
        Write-Host ""
        exit 0
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Invalid choice" -ForegroundColor Red
        Write-Host ""
        exit 1
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host
Write-Host "🧪 Testing Instructions:" -ForegroundColor Yellow
Write-Host "  1. Open Incognito Window" -ForegroundColor White
Write-Host "  2. Go to: http://localhost:3000/party/join" -ForegroundColor White
Write-Host "  3. Guest Test: Enter '1696' (should go to onboarding)" -ForegroundColor White
Write-Host "  4. Admin Test: Click 'Host Login', enter '2026'" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full Guide: SECURITY_FIX_IMPLEMENTATION.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Done!" -ForegroundColor Green
Write-Host ""
