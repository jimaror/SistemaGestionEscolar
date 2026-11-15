@echo off
title Mantener servicios despiertos - Colegio Otto de la Rocha
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -NoProfile -File "MANTENER-DESPIERTO.ps1"
pause
