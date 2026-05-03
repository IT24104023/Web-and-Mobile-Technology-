@echo off
title DentAI Launcher
color 0A

echo.
echo  ==========================================
echo       DentAI - Full System Launcher
echo  ==========================================
echo.

REM Get the folder this bat lives in
set "ROOT=%~dp0"

REM ─── Detect WiFi IP via PowerShell ───────────────────────────────────────────
for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.IPAddress -notmatch '^192\.168\.56\.' } | Select-Object -First 1 -ExpandProperty IPAddress"`) do (
    set "LOCAL_IP=%%I"
)

if "%LOCAL_IP%"=="" set "LOCAL_IP=172.28.30.202"
echo    IP detected: %LOCAL_IP%

REM ─── Patch app.json ──────────────────────────────────────────────────────────
powershell -NoProfile -Command "$p='%ROOT%frontend-mobile\app.json'; $c=(Get-Content $p -Raw) -replace '\"apiBaseUrl\": \"http://[^\"]*\"','\"apiBaseUrl\": \"http://%LOCAL_IP%:5000\"'; [System.IO.File]::WriteAllText($p, $c)"
echo    app.json patched with http://%LOCAL_IP%:5000
echo.

REM ─── Write temp bat: Backend ──────────────────────────────────────────────────
powershell -NoProfile -Command "$bat=@('`@echo off','title DentAI - Backend (Port 5000)','color 0B','cd /d \"%ROOT%backend\"','echo.','echo  [DentAI] Starting Backend Server...','echo  [DentAI] URL: http://localhost:5000','echo.','npm install','npm run dev','echo.','echo  [!] Server stopped. Press any key to close.','pause'); [System.IO.File]::WriteAllLines('%TEMP%\dentai_b.bat', $bat)"

REM ─── Write temp bat: Web ──────────────────────────────────────────────────────
powershell -NoProfile -Command "$bat=@('`@echo off','title DentAI - Web Frontend (Port 5173)','color 0E','cd /d \"%ROOT%frontend-web\"','echo.','echo  [DentAI] Starting Web Frontend...','echo  [DentAI] URL: http://localhost:5173','echo.','npm install','npm run dev','echo.','echo  [!] Server stopped. Press any key to close.','pause'); [System.IO.File]::WriteAllLines('%TEMP%\dentai_w.bat', $bat)"

REM ─── Write temp bat: Mobile ──────────────────────────────────────────────────
powershell -NoProfile -Command "$bat=@('`@echo off','title DentAI - Mobile Expo','color 0D','cd /d \"%ROOT%frontend-mobile\"','echo.','echo  [DentAI] Starting Expo Mobile App...','echo  [DentAI] Backend: http://%LOCAL_IP%:5000','echo.','echo  SCAN QR CODE with Expo Go app on your phone','echo  (Phone must be on same WiFi as this laptop)','echo.','npx expo start --clear','echo.','echo  [!] Expo stopped. Press any key to close.','pause'); [System.IO.File]::WriteAllLines('%TEMP%\dentai_m.bat', $bat)"

REM ─── Launch all 3 in separate persistent windows ──────────────────────────────
echo [1/3] Starting Backend...
start "DentAI Backend" cmd /k "%TEMP%\dentai_b.bat"
timeout /t 4 /nobreak >nul

echo [2/3] Starting Web Frontend...
start "DentAI Web" cmd /k "%TEMP%\dentai_w.bat"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Expo Mobile...
start "DentAI Mobile" cmd /k "%TEMP%\dentai_m.bat"

echo.
echo  ==========================================
echo    SUCCESS! 3 windows have opened.
echo  ==========================================
echo.
echo   WEB PORTAL  ^> http://localhost:5173
echo   BACKEND API ^> http://localhost:5000
echo   MOBILE IP   ^> http://%LOCAL_IP%:5000
echo.
echo   ADMIN: admin123@gmail.com / admin123
echo.
echo  This window is safe to close.
echo  ==========================================
pause
