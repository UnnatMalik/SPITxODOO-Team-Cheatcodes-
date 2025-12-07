@echo off
echo ================================================
echo    Starting QuickTrace Application
echo ================================================
echo.

REM Start Backend (Django)
echo [1/2] Starting Django Backend Server...
start "QuickTrace Backend" cmd /k "cd backend && python manage.py runserver"
timeout /t 3 /nobreak >nul

REM Start Frontend (Next.js)
echo [2/2] Starting Next.js Frontend Server...
start "QuickTrace Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ================================================
echo    Both servers are starting...
echo    Backend:  http://127.0.0.1:8000
echo    Frontend: http://localhost:3000
echo ================================================
echo.
echo Press any key to close this window (servers will keep running)
pause >nul
