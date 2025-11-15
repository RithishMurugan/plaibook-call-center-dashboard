# Git Commit and Push Script for Plaibook Dashboard

Write-Host "`n=== Git Commit and Push ===" -ForegroundColor Cyan

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# Check if remote exists
$remoteExists = git remote | Select-String -Pattern "origin"
if (-not $remoteExists) {
    Write-Host "`n⚠ No remote repository configured!" -ForegroundColor Yellow
    Write-Host "Please create a repository on GitHub first:" -ForegroundColor White
    Write-Host "1. Go to https://github.com/new" -ForegroundColor Gray
    Write-Host "2. Create repository: plaibook-call-center-dashboard" -ForegroundColor Gray
    Write-Host "3. Copy the repository URL" -ForegroundColor Gray
    Write-Host "`nThen run:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/plaibook-call-center-dashboard.git" -ForegroundColor Green
    Write-Host "`nPress any key to continue with commit only (without push)..." -ForegroundColor Cyan
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# Stage all files
Write-Host "`n📦 Staging all files..." -ForegroundColor Yellow
git add .

# Show what will be committed
Write-Host "`n📋 Files to be committed:" -ForegroundColor Yellow
git status --short

# Commit
Write-Host "`n💾 Creating commit..." -ForegroundColor Yellow
$commitMessage = @"
Initial commit: Complete Plaibook Call Center Analytics Dashboard

Features:
- Nate's View with 4 answer cards
- Global filters (Agent, Sentiment, Call Type)
- Drill-down panels for all charts
- Missed opportunity pattern mining (6 patterns)
- Rep coaching suggestions
- Revenue impact analysis with adjustable assumptions
- Two separate pipelines (Sales + Inspection funnels)
- LLM-powered transcript analysis (Gemini 2.5)
- Precomputed metrics with caching
- 12 comprehensive screenshots
- Complete documentation (README, SETUP guide)

All 10 required parts + bonus features implemented.
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Commit successful!" -ForegroundColor Green
    
    # Check if remote exists before pushing
    $remoteExists = git remote | Select-String -Pattern "origin"
    if ($remoteExists) {
        Write-Host "`n🚀 Pushing to GitHub..." -ForegroundColor Yellow
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n✅ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host "`n🔗 Your repository is now live!" -ForegroundColor Cyan
        } else {
            Write-Host "`n⚠ Push failed. Check your GitHub credentials." -ForegroundColor Yellow
            Write-Host "You may need to use a Personal Access Token instead of password." -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n⚠ No remote configured. Commit is local only." -ForegroundColor Yellow
        Write-Host "Add remote with: git remote add origin <your-repo-url>" -ForegroundColor Gray
    }
} else {
    Write-Host "`n❌ Commit failed. Check for errors above." -ForegroundColor Red
}

Write-Host "`n=== Done ===" -ForegroundColor Cyan

