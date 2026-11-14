@echo off
title Colegio Otto de la Rocha - INICIAR SISTEMA COMPLETO
color 0D

set "BASE=C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar"
cd /d "%BASE%"

echo ============================================================
echo   COLEGIO OTTO DE LA ROCHA
echo   Iniciando sistema completo
echo ============================================================
echo.

echo [1/4] Limpiando procesos anteriores...
taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
if exist cloudflared.log del cloudflared.log >nul 2>&1
if exist cloudflared.err del cloudflared.err >nul 2>&1
timeout /t 3 >nul

echo [2/4] Iniciando BACKEND (puerto 8080)...
start "Backend" cmd /k "cd /d ""%BASE%"" && java -jar target\escolar-0.0.1-SNAPSHOT.jar"
timeout /t 20 >nul

echo [3/4] Iniciando FRONTEND (puerto 3000)...
start "Frontend" cmd /k "cd /d ""%BASE%\frontend"" && npm start"
timeout /t 12 >nul

echo [4/4] Iniciando TUNEL (acceso desde internet)...
start "Tunel" cmd /c "cd /d ""%BASE%"" && cloudflared.exe tunnel --url http://localhost:3000 --no-autoupdate > cloudflared.log 2>&1"
timeout /t 15 >nul

echo.
echo ============================================================
echo   BUSCANDO TU URL PUBLICA...
echo ============================================================
echo.

set "URL="
for /f "tokens=* delims=" %%a in ('powershell -NoProfile -ExecutionPolicy Bypass -File "%BASE%\leer-url.ps1"') do (
    set "TMP=%%a"
)
set "URL=%TMP:URL ENCONTRADA: =%"

if "%URL%"=="" (
    echo  No se encontro la URL. Mira la ventana "Tunel".
    echo  Presiona cualquier tecla para cerrar...
    pause >nul
    exit /b
)

echo.
echo  ============================================================
echo    TU URL PARA COMPARTIR:
echo.
echo      %URL%
echo  ============================================================
echo.
echo  Usuario:     director1
echo  Contrasena:  pass123
echo.
echo  Copia esa URL y mandasela a quien quieras.
echo.
start "" "%URL%"

echo  Se abrio el navegador. Presiona cualquier tecla para cerrar.
pause >nul
