@echo off
echo ========================================
echo   International Sales Dashboard
echo ========================================
echo.
echo [+] Starting dashboard...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [+] Python detected - Starting HTTP server on port 8080
    echo [+] Dashboard will open at: http://localhost:8080
    echo [+] Press Ctrl+C to stop the server
    echo.
    start http://localhost:8080
    python -m http.server 8080
) else (
    echo [!] Python not found - Opening file directly
    echo.
    start index.html
)

pause
