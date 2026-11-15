@echo off
title Preparar exposicion - Colegio Otto de la Rocha
cd /d "%~dp0"

echo ===============================================
echo   PREPARANDO LA EXPOSICION
echo   Despertando backend y frontend...
echo   Esto puede tardar hasta 2 minutos.
echo ===============================================
echo.

powershell -ExecutionPolicy Bypass -NoProfile -File "MANTENER-DESPIERTO.ps1" -AbrirNavegador

pause
