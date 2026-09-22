@echo off
chcp 65001 >nul
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

echo ================================
echo ShelterLab 一鍵更新
echo ================================
echo.

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"

if not defined CURRENT_BRANCH goto :not_repo
if /I not "%CURRENT_BRANCH%"=="feature/student-map" goto :wrong_branch

echo 目前分支：%CURRENT_BRANCH%
echo 正在取得最新版本...
echo.

git fetch origin feature/student-map
if errorlevel 1 goto :fetch_failed

rem 若遠端即將納管本機同名的未追蹤地圖圖片，先移到可復原備份資料夾。
for %%F in (
  public/student-map/week-1.webp
  public/student-map/week-2.webp
  public/student-map/week-3.webp
  public/student-map/week-4.webp
  public/student-map/week-5.webp
  public/student-map/week-6.webp
) do call :backup_untracked "%%F"

git merge --ff-only origin/feature/student-map
if errorlevel 1 goto :update_failed

echo.
echo ================================
echo 更新完成！
echo ================================
if defined BACKUP_READY echo 原本的本機圖片已保留在：%BACKUP_DIR%
echo 如果 npm.cmd run dev 已經在另一個 PowerShell 視窗執行，
echo 直接回瀏覽器即可，Next.js 會自動重新載入。
echo.
pause
exit /b 0

:backup_untracked
if not exist "%~1" exit /b 0
git ls-files --error-unmatch -- "%~1" >nul 2>&1
if not errorlevel 1 exit /b 0
git cat-file -e "origin/feature/student-map:%~1" >nul 2>&1
if errorlevel 1 exit /b 0
if defined BACKUP_READY goto :move_backup
set "BACKUP_DIR=_local-backup\student-map-images-%RANDOM%"
mkdir "%BACKUP_DIR%" >nul 2>&1
set "BACKUP_READY=1"
echo 偵測到同名的本機圖片，正在安全備份...
:move_backup
move /Y "%~1" "%BACKUP_DIR%\" >nul
echo 已備份：%~1
exit /b 0

:not_repo
echo [錯誤] 這個檔案必須放在 ShelterLab Git 專案資料夾內執行。
echo.
pause
exit /b 1

:wrong_branch
echo [停止] 目前分支是：%CURRENT_BRANCH%
echo 請先切到 feature/student-map，再重新執行這個檔案。
echo.
pause
exit /b 1

:fetch_failed
echo.
echo [更新失敗] 無法取得遠端版本，請檢查網路連線後重試。
echo.
pause
exit /b 1

:update_failed
echo.
echo [更新失敗] 本機仍有其他尚未處理的修改，更新程序沒有覆蓋任何檔案。
echo 請將這個視窗的完整錯誤訊息截圖傳給 ChatGPT。
echo.
pause
exit /b 1
