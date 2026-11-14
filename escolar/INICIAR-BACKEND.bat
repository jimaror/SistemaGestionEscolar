@echo off
title Colegio Otto de la Rocha - Backend
color 0B
cd /d "C:\Users\JMarkz\Desktop\ProyectoWebEscolar\escolar"

echo ============================================================
echo   COLEGIO OTTO DE LA ROCHA - BACKEND (puerto 8080)
echo ============================================================
echo.
echo Iniciando el servidor backend...
echo (espera a ver: Started EscolarApplication)
echo.

taskkill /f /im java.exe >nul 2>&1
timeout /t 2 >nul

java -jar target\escolar-0.0.1-SNAPSHOT.jar

echo.
echo El backend se detuvo. Presiona cualquier tecla para cerrar.
pause >nul
