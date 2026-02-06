# 🚀 Party Companion Setup Script
# Run this after initial installation

Write-Host "🎉 Party Companion App - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local found" -ForegroundColor Green
} else {
    Write-Host "❌ .env.local not found!" -ForegroundColor Red
    Write-Host "Please create .env.local with your Neon and Gemini credentials" -ForegroundColor Yellow
    exit 1
}

# Check for required packages
Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan

$packages = @(
    "@google/generative-ai",
    "framer-motion",
    "@neondatabase/serverless",
    "drizzle-orm"
)

$packageJson = Get-Content "package.json" | ConvertFrom-Json
$missingPackages = @()

foreach ($package in $packages) {
    if ($packageJson.dependencies.$package) {
        Write-Host "  ✅ $package" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $package missing" -ForegroundColor Red
        $missingPackages += $package
    }
}

if ($missingPackages.Count -gt 0) {
    Write-Host ""
    Write-Host "Installing missing packages..." -ForegroundColor Yellow
    npm install $missingPackages
}

# Database setup
Write-Host ""
Write-Host "🗄️ Database Setup" -ForegroundColor Cyan
Write-Host "Would you like to push the schema to Neon now? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "Generating migrations..." -ForegroundColor Cyan
    npm run db:generate
    
    Write-Host "Pushing to Neon..." -ForegroundColor Cyan
    npm run db:push
    
    Write-Host "✅ Database schema pushed!" -ForegroundColor Green
} else {
    Write-Host "⏭️ Skipped database push. Run 'npm run db:push' when ready." -ForegroundColor Yellow
}

# Seed data
Write-Host ""
Write-Host "🌱 Seed Data" -ForegroundColor Cyan
Write-Host "Would you like to seed example games? (Y/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "Creating example games..." -ForegroundColor Cyan
    
    $seedScript = @"
-- Seed example games
INSERT INTO games (name, scoring_type, icon, description) VALUES
  ('Sim Racing', 'TIME_ASC', '🏎️', 'Fastest lap time wins'),
  ('Dominoes', 'SCORE_DESC', '🎲', 'Highest score wins'),
  ('VR Beat Saber', 'SCORE_DESC', '🎮', 'Highest score wins'),
  ('Chess', 'SCORE_DESC', '♟️', 'Points based on game outcomes'),
  ('Mario Kart', 'TIME_ASC', '🏁', 'Fastest race time wins')
ON CONFLICT DO NOTHING;
"@
    
    $seedScript | Out-File -FilePath "drizzle/seed.sql" -Encoding UTF8
    Write-Host "✅ Seed script created at drizzle/seed.sql" -ForegroundColor Green
    Write-Host "Run: psql [your-neon-url] -f drizzle/seed.sql" -ForegroundColor Yellow
} else {
    Write-Host "⏭️ Skipped seed data." -ForegroundColor Yellow
}

# Final checks
Write-Host ""
Write-Host "🔍 Environment Variables Check" -ForegroundColor Cyan
$envContent = Get-Content ".env.local" -Raw

if ($envContent -match "DATABASE_URL.*neon") {
    Write-Host "  ✅ DATABASE_URL configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ DATABASE_URL missing or incorrect" -ForegroundColor Red
}

if ($envContent -match "GEMINI_API_KEY") {
    Write-Host "  ✅ GEMINI_API_KEY configured" -ForegroundColor Green
} else {
    Write-Host "  ⚠️ GEMINI_API_KEY missing (required for AI features)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Add GEMINI_API_KEY to .env.local (get from ai.google.dev)" -ForegroundColor White
Write-Host "  2. Run: npm run dev" -ForegroundColor White
Write-Host "  3. Visit: http://localhost:9002" -ForegroundColor White
Write-Host "  4. Read: PARTY_COMPANION_README.md for full documentation" -ForegroundColor White
Write-Host ""
Write-Host "🎮 Modules Available:" -ForegroundColor Cyan
Write-Host "  • Party Brain (AI Planning)" -ForegroundColor White
Write-Host "  • Universal Leaderboard (Rankings)" -ForegroundColor White
Write-Host "  • Imposter Game (Social Deduction)" -ForegroundColor White
Write-Host "  • Expense Scanner (OCR Receipts)" -ForegroundColor White
Write-Host ""
Write-Host "Happy party hosting! 🎉" -ForegroundColor Magenta
