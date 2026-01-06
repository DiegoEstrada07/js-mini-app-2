@echo off
REM Script para instalar dependencias e iniciar el servidor Node.js

echo.
echo ====================================
echo  Royal Coins - Expense Tracker
echo ====================================
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no está instalado.
    echo Descárgalo desde: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detectado
echo.

REM Verificar si npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no está instalado.
    pause
    exit /b 1
)

echo ✓ npm detectado
echo.

REM Instalar dependencias
echo Instalando dependencias...
call npm install
echo.

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Falló la instalación de dependencias.
    pause
    exit /b 1
)

echo ✓ Dependencias instaladas correctamente
echo.

REM Iniciar el servidor
echo Iniciando servidor...
echo.
echo ====================================
echo  Servidor corriendo en:
echo  http://localhost:3000
echo.
echo  Abre en tu navegador:
echo  http://localhost:3000/pages/home.html
echo ====================================
echo.

call npm start
