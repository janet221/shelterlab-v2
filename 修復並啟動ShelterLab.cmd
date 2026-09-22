@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ================================
echo ShelterLab 修復並重新啟動
echo ================================
echo.
echo 1/3 關閉這個專案舊的 Next.js / Node 開發程序...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$root=[regex]::Escape((Resolve-Path '.').Path); Get-CimInstance Win32_Process ^| Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -match $root } ^| ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }" >nul 2>&1

echo 2/3 清除 Next.js 暫存...
if exist ".next" rmdir /s /q ".next"

echo 3/3 啟動 ShelterLab...
echo.
echo 請等到畫面出現「Local: http://localhost:xxxx」和「Ready」。
echo 之後只開那一個最新的 localhost 網址。
echo.
npm.cmd run dev
