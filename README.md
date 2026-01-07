# Royal Coins - Expense Tracker

A web application to track income and expenses with an interactive dashboard and a Node.js server.

## Features

- Dashboard with Income, Expenses, and Savings visuals
- Recent transactions table
- Form to add Income and Expenses
- Persistent JSON database
- Node.js server with Express
- RESTful API
- Automatic syncing

## Installation and Run

### Requirements
- Node.js 14+ ([download](https://nodejs.org/))
- npm (included with Node.js)

### Steps

1. Open Git Bash

2. Paste the path: cd "U:\P4 Education\js-mini-app-2\src"

3. Run: npm start

4. Open your browser at: http://localhost:3000/pages/home.html


## Project Structure

```
js-mini-app-2/
├── script/
│   ├── calendar.js          # Calendar logic
│   ├── dataManager.js       # API data manager
│   ├── expenses.js          # Expenses page logic
│   ├── home.js              # Dashboard logic
│   └── server.js            # Node.js/Express server

├── pages/
│   ├── home.html            # Dashboard
│   ├── expenses.html        # Add Income/Expenses
│   └── calendar.html        # Calendar & reminders

├── css/
│   ├── home.css             # Dashboard styles
│   ├── expenses.css         # Expenses styles
│   └── calendar.css         # Calendar styles

├── src/
│   └── data.json            # JSON database
│   └── package.json         # Dependencies

├── start-server.bat         # Windows start script
├── start-server.sh          # Mac/Linux start script
└── README.md                # This file
```

## How It Works

### Data Flow
1. User adds a transaction in **Expenses** -> sent to the server
2. Server stores it in **data.json** -> recalculates totals
3. Dashboard in **Home** updates automatically
4. User adds a Reminder in **Calendar** -> When the payment day has passed, the transaction is added to expenses and the reminder is eliminated.
4. Data persists even after closing the browser

### API Endpoints

```
GET    /api/transactions      # Get all transactions
POST   /api/transactions      # Add a new transaction
DELETE /api/transactions/:id  # Delete a transaction
GET    /api/totals            # Get totals (income/expenses/savings)
```

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js, Express.js
- **Database**: JSON (data.json)
- **Other**: CORS, Body Parser

## Example Transaction

```json
{
  "id": 1704362234000,
  "date": "2025-01-04",
  "type": "expense",
  "item": "Groceries",
  "description": "Supermarket shopping",
  "category": "Food",
  "amount": -120.00
}
```

## Troubleshooting

### "Is the server running?"
- Make sure `npm start` is running
- The server should be at `http://localhost:3000`

### "Server connection error"
- Check Node.js installation: `node --version`
- Reinstall dependencies: `npm install`
- Restart the server

### "Data is not saving"
- Verify `src/data.json` exists
- Check write permissions for the project folder
- Review the browser console (F12) for errors

## Support

If you have issues, check:
1. Browser console (F12)
2. Terminal running the server
3. That `src/data.json` exists in the project root


