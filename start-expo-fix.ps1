# Expo Development Server - Complete Fix Script
# This script solves the "10:232.156.189" malformed IP issue

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Expo Development Server Fixer" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Set environment variables for THIS session
Write-Host "[1/5] Setting environment variables..." -ForegroundColor Yellow
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "10.232.156.189"
$env:EXPO_PACKAGER_HOSTNAME = "10.232.156.189"

Write-Host "  ✓ REACT_NATIVE_PACKAGER_HOSTNAME = $($env:REACT_NATIVE_PACKAGER_HOSTNAME)" -ForegroundColor Green
Write-Host "  ✓ EXPO_PACKAGER_HOSTNAME = $($env:EXPO_PACKAGER_HOSTNAME)" -ForegroundColor Green
Write-Host ""

# Step 2: Clear Expo cache
Write-Host "[2/5] Clearing Expo cache..." -ForegroundColor Yellow
Remove-Item -Path $env:USERPROFILE\.expo -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Cache cleared" -ForegroundColor Green
Write-Host ""

# Step 3: Clear Metro bundler cache
Write-Host "[3/5] Clearing Metro bundler cache..." -ForegroundColor Yellow
Remove-Item -Path ".\.expo\dev" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path ".\.metro-cache" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Metro cache cleared" -ForegroundColor Green
Write-Host ""

# Step 4: Kill any existing Expo/Metro processes
Write-Host "[4/5] Stopping any existing Expo/Metro processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "expo|metro" } | Stop-Process -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ Processes cleaned" -ForegroundColor Green
Write-Host ""

# Step 5: Start Expo with explicit hostname
Write-Host "[5/5] Starting Expo with hostname 10.232.156.189..." -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  IMPORTANT: When Expo starts, look for this URL pattern:" -ForegroundColor Magenta
Write-Host "    ✓ CORRECT:     exp://10.232.156.189:8081" -ForegroundColor Green
Write-Host "    ✗ WRONG:       exp://10:232.156.189:8081  (with colon instead of dot)" -ForegroundColor Red
Write-Host ""

# Start Expo
npx expo start -c --lan
