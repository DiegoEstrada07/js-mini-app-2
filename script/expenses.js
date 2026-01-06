let transactionsByType = {
    income: [],
    expense: []
};

// Initialize tables on page load
async function initializeTables() {
    const transactions = await DataManager.getTransactions();
    
    // Separate by type
    transactionsByType.income = transactions.filter(t => t.type === 'income');
    transactionsByType.expense = transactions.filter(t => t.type === 'expense');

    // Render tables
    renderIncome();
    renderExpense();
    updateBalance();
}

function openModal() {
    document.getElementById("modal").style.display = "flex";
    // Reset form
    document.getElementById("type").value = "income";
    document.getElementById("item").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("category").value = "";
    document.getElementById("qty").value = "";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

async function addData() {
    const type = document.getElementById("type").value;
    const item = document.getElementById("item").value;
    const desc = document.getElementById("desc").value;
    const category = document.getElementById("category").value;
    const amount = parseFloat(document.getElementById("qty").value);

    if (!item || !amount) {
        alert("Completa los campos Item y Amount");
        return;
    }

    // Create transaction object
    const transaction = {
        type: type,
        description: item,
        item: item,
        category: category || 'Other',
        amount: type === 'expense' ? -Math.abs(amount) : amount
    };

    try {
        // Save to server
        await DataManager.addTransaction(transaction);
        
        // Refresh tables
        await initializeTables();
        closeModal();
    } catch (error) {
        console.error('Error:', error);
    }
}

async function deleteTransaction(id) {
    if (confirm("¿Eliminar esta transacción?")) {
        try {
            await DataManager.deleteTransaction(id);
            await initializeTables();
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

function renderIncome() {
    const tbody = document.querySelector("#incomeTable tbody");
    tbody.innerHTML = "";

    transactionsByType.income.forEach((t, index) => {
        const date = new Date(t.date).toLocaleDateString();
        const time = new Date(t.date).toLocaleTimeString();

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${t.item || t.description}</td>
            <td>${t.description || '-'}</td>
            <td>${t.category}</td>
            <td>${formatCurrency(t.amount)}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
            </td>
        `;
    });
}

function renderExpense() {
    const tbody = document.querySelector("#expenseTable tbody");
    tbody.innerHTML = "";

    transactionsByType.expense.forEach((t, index) => {
        const date = new Date(t.date).toLocaleDateString();
        const time = new Date(t.date).toLocaleTimeString();

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${t.item || t.description}</td>
            <td>${t.description || '-'}</td>
            <td>${t.category}</td>
            <td>${formatCurrency(Math.abs(t.amount))}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>
                <button class="delete-btn" onclick="deleteTransaction(${t.id})">🗑️</button>
            </td>
        `;
    });
}

async function updateBalance() {
    const totals = await DataManager.calculateTotals();
    
    // Update totals
    const incomeTotal = transactionsByType.income.reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = transactionsByType.expense.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    document.getElementById("incomeTotal").textContent = formatCurrency(incomeTotal);
    document.getElementById("expenseTotal").textContent = formatCurrency(expenseTotal);
    document.getElementById("sidebarBalance").textContent = formatCurrency(totals.total);
}

// Initialize on page load
window.addEventListener('load', initializeTables);

// Listen for custom transaction events
window.addEventListener('transactionAdded', initializeTables);
window.addEventListener('transactionDeleted', initializeTables);
