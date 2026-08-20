@echo off
firebase use rendicion-de-cuentas-6aceb
if errorlevel 1 exit /b 1
firebase deploy --only functions
