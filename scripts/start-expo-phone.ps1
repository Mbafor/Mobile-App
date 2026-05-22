# Starts Expo so physical phones on home Wi-Fi can load the app.
# Fixes "Failed to download remote update" when Expo picks the wrong network IP.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Get-BestLanIp {
  $candidates = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
      $_.IPAddress -notlike '127.*' -and
      $_.IPAddress -notlike '169.254.*' -and
      $_.PrefixOrigin -ne 'WellKnown'
    } |
    Sort-Object -Property @{
      Expression = {
        if ($_.IPAddress -like '192.168.*') { 0 }
        elseif ($_.IPAddress -like '10.*') { 1 }
        else { 2 }
      }
    }, InterfaceMetric

  if ($candidates.Count -eq 0) {
    return $null
  }
  return $candidates[0].IPAddress
}

$ip = Get-BestLanIp
if (-not $ip) {
  Write-Host "No LAN IP found. Try: npm run start:tunnel" -ForegroundColor Red
  exit 1
}

Write-Host ""
Write-Host "Using LAN IP for Expo Go: $ip" -ForegroundColor Green
Write-Host "On your phone (same Wi-Fi), open Expo Go and enter:" -ForegroundColor Cyan
Write-Host "  exp://${ip}:8081" -ForegroundColor Yellow
Write-Host ""
Write-Host "If that fails, run: npm run start:tunnel" -ForegroundColor Gray
Write-Host ""

$env:REACT_NATIVE_PACKAGER_HOSTNAME = $ip
$env:NODE_OPTIONS = "--max-old-space-size=8192"
npx expo start --lan -c
