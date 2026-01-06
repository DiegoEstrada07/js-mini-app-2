# 🪙 Royal Coins - Expense Tracker

Una aplicación web para rastrear ingresos y gastos con un dashboard interactivo y servidor Node.js.

## 📋 Características

- ✅ Dashboard con visualización de Income, Expenses y Savings
- ✅ Tabla de transacciones recientes
- ✅ Formulario para agregar Income y Expenses
- ✅ Base de datos JSON persistente
- ✅ Servidor Node.js con Express
- ✅ API RESTful
- ✅ Sincronización automática

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js 14+ ([descargar](https://nodejs.org/))
- npm (incluido con Node.js)

### Pasos

1. **Abre PowerShell** en la carpeta del proyecto

2. **Ejecuta el script de inicio:**

```powershell
.\start-server.bat
```

O si prefieres hacerlo manualmente:

```powershell
npm install
npm start
```

3. **Abre tu navegador** en:
```
http://localhost:3000/pages/home.html
```

## 📁 Estructura del Proyecto

```
js-mini-app-2/
├── server.js                 # Servidor Node.js/Express
├── data.json                 # Base de datos (JSON)
├── package.json              # Dependencias
├── start-server.bat          # Script para Windows
├── start-server.sh           # Script para Mac/Linux
├── README.md                 # Este archivo
├── pages/
│   ├── home.html            # Dashboard
│   ├── expenses.html        # Agregar Income/Expenses
│   └── calendar.html        # Calendario (futuro)
└── src/
    ├── home.css             # Estilos del dashboard
    ├── expenses.css         # Estilos de expenses
    ├── calendar.css         # Estilos del calendario
    └── dataManager.js       # Gestor de datos (API)
```

## 🔄 Cómo Funciona

### Flujo de Datos
1. Usuario agrega transacción en **Expenses** → Se envía al servidor
2. Servidor guarda en **data.json** → Calcula totales
3. Dashboard en **Home** se actualiza automáticamente
4. Los datos persisten incluso si cierras el navegador

### API Endpoints

```
GET    /api/transactions      # Obtener todas las transacciones
POST   /api/transactions      # Agregar nueva transacción
DELETE /api/transactions/:id  # Eliminar transacción
GET    /api/totals            # Obtener totales (income/expenses/savings)
```

## 🛠️ Tecnologías Usadas

- **Frontend**: HTML5, CSS3, JavaScript Vanilla
- **Backend**: Node.js, Express.js
- **Database**: JSON (data.json)
- **Otros**: CORS, Body Parser

## 📝 Ejemplo de Transacción

```json
{
  "id": 1704362234000,
  "date": "2025-01-04",
  "type": "expense",
  "item": "Groceries",
  "description": "Compras en el supermercado",
  "category": "Food",
  "amount": -120.00
}
```

## ⚠️ Solución de Problemas

### "¿El servidor está corriendo?"
- Asegúrate de que `npm start` está ejecutándose
- El servidor debe estar en `http://localhost:3000`

### "Error de conexión al servidor"
- Verifica que Node.js esté instalado: `node --version`
- Reinstala dependencias: `npm install`
- Reinicia el servidor

### "Los datos no se guardan"
- Verifica que `data.json` existe en la carpeta raíz
- Comprueba los permisos de escritura de la carpeta
- Revisa la consola del navegador (F12) para errores

## 📧 Soporte

Si tienes problemas, revisa:
1. Consola del navegador (F12)
2. Terminal donde corre el servidor
3. Que data.json esté en la carpeta raíz del proyecto

---

**Hecho con ❤️ para Royal Coins**