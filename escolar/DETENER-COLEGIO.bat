@echo off
title Colegio Otto de la Rocha - Detener sistema
color 0C

echo ============================================================
echo   COLEGIO OTTO DE LA ROCHA - DETENER TODO
echo ============================================================
echo.
echo Cerrando backend, frontend y tunel...
echo.

taskkill /f /im java.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cloudflared.exe >nul 2>&1
taskkill /f /im ngrok.exe >nul 2>&1

echo.
echo  Todo detenido.
echo.
echo  El link publico ya no funciona.
echo  Para volver a iniciar, doble clic en INICIAR-COLEGIO.bat
echo.
echo Presiona cualquier tecla para cerrar...
pause >nul
