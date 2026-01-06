const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Path to data.json
const dataPath = path.join(__dirname, '..', 'src', 'data.json');

// Helper function to read data from JSON
function readData() {
    try {
        const data = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data.json:', error);
        return { transactions: [], savings: 0 };
    }
}

// Helper function to write data to JSON
function writeData(data) {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
        console.log('Data saved to data.json');
    } catch (error) {
        console.error('Error writing to data.json:', error);
    }
}

// GET all transactions
app.get('/api/transactions', (req, res) => {
    const data = readData();
    res.json(data.transactions);
});

// POST new transaction
app.post('/api/transactions', (req, res) => {
    const data = readData();
    const transaction = req.body;

    // Add ID and date if not present
    transaction.id = Date.now();
    transaction.date = new Date().toISOString().split('T')[0];

    data.transactions.push(transaction);

    // Recalculate savings
    let income = 0;
    let expenses = 0;
    data.transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else if (t.type === 'expense') {
            expenses += Math.abs(t.amount);
        }
    });
    data.savings = income - expenses;

    writeData(data);
    res.status(201).json(transaction);
});

// DELETE transaction
app.delete('/api/transactions/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;

    data.transactions = data.transactions.filter(t => t.id !== parseInt(id));

    // Recalculate savings
    let income = 0;
    let expenses = 0;
    data.transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else if (t.type === 'expense') {
            expenses += Math.abs(t.amount);
        }
    });
    data.savings = income - expenses;

    writeData(data);
    res.json({ message: 'Transaction deleted', transactions: data.transactions });
});

// GET totals
app.get('/api/totals', (req, res) => {
    const data = readData();
    let income = 0;
    let expenses = 0;

    data.transactions.forEach(t => {
        if (t.type === 'income') {
            income += t.amount;
        } else if (t.type === 'expense') {
            expenses += Math.abs(t.amount);
        }
    });

    res.json({
        income,
        expenses,
        savings: income - expenses,
        total: income - expenses
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📁 Data guardándose en: ${dataPath}`);
});
