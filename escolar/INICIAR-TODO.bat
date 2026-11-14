@echo off
title Iniciar Backend + Frontend (Colegio Otto de la Rocha)
cd /d "C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar"

echo ============================================================
echo   Iniciando Backend (puerto 8080)...
echo ============================================================
echo.

start "Backend Spring Boot" cmd /k "cd /d ""C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar"" && java -jar target\escolar-0.0.1-SNAPSHOT.jar"

timeout /t 25 >nul

echo ============================================================
echo   Iniciando Frontend (puerto 3000)...
echo ============================================================
echo.

start "Frontend Next.js" cmd /k "cd /d ""C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar\frontend"" && npm run dev"

echo.
echo Las dos ventanas se abrieron. Espera a que:
echo   - Backend diga:  Started EscolarApplication
echo   - Frontend diga: Ready in Xms
echo.
echo Luego abre:  http://localhost:3000
echo.
pause
