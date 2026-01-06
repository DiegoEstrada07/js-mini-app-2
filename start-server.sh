#!/bin/bash

echo ""
echo "===================================="
echo "  Royal Coins - Expense Tracker"
echo "===================================="
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado."
    echo "Descárgalo desde: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js detectado"
echo ""

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado."
    exit 1
fi

echo "✓ npm detectado"
echo ""

# Instalar dependencias
echo "Instalando dependencias..."
npm install
echo ""

if [ $? -ne 0 ]; then
    echo "ERROR: Falló la instalación de dependencias."
    exit 1
fi

echo "✓ Dependencias instaladas correctamente"
echo ""

# Iniciar el servidor
echo "Iniciando servidor..."
echo ""
echo "===================================="
echo "  Servidor corriendo en:"
echo "  http://localhost:3000"
echo ""
echo "  Abre en tu navegador:"
echo "  http://localhost:3000/pages/home.html"
echo "===================================="
echo ""

npm start
