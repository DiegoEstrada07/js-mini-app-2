import { DataManager, formatCurrency, formatDate } from "./dataManager.js";

const transactionsByType = {
    income: [],
    expense: []
};

const state = {
    filterText: "",
    budget: 0
};

function normalizeCategory(value) {
    const cleaned = value.trim().replace(/\s+/g, " ");
    if (!cleaned) return "Other";
    const lower = cleaned.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function slugify(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildCategoryList(transactions) {
    const categories = new Set();
    transactions.forEach(t => {
        if (t.category) {
            categories.add(normalizeCategory(t.category));
        }
    });

    const list = document.getElementById("categoryList");
    list.innerHTML = "";
    Array.from(categories).sort().forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        list.appendChild(option);
    });
}

function filterTransactions(list) {
    if (!state.filterText) return list;
    const query = state.filterText;
    return list.filter(t => {
        const item = (t.item || t.description || "").toString().toLowerCase();
        const category = (t.category || "").toString().toLowerCase();
        return item.includes(query) || category.includes(query);
    });
}

function openModal() {
    $("#modal").fadeIn(150);
    document.getElementById("type").value = "income";
    document.getElementById("item").value = "";
    document.getElementById("note").value = "";
    document.getElementById("category").value = "";
    document.getElementById("date").value = "";
    document.getElementById("qty").value = "";
}

function closeModal() {
    $("#modal").fadeOut(150);
}

async function initializeTables() {
    const transactions = await DataManager.getTransactions();

    transactionsByType.income = transactions.filter(t => t.type === "income");
    transactionsByType.expense = transactions.filter(t => t.type === "expense");

    buildCategoryList(transactions);
    renderIncome();
    renderExpense();
    updateBalance();
}

async function addData() {
    const type = document.getElementById("type").value;
    const item = document.getElementById("item").value.trim();
    const note = document.getElementById("note").value.trim();
    const categoryRaw = document.getElementById("category").value;
    const dateValue = document.getElementById("date").value;
    const amountValue = document.getElementById("qty").value.trim();
    const amount = parseFloat(amountValue);

    if (!item || Number.isNaN(amount)) {
        alert("Completa los campos Item y Amount");
        return;
    }

    const category = normalizeCategory(categoryRaw);
    const signedAmount = type === "expense" ? -Math.abs(amount) : Math.abs(amount);

    const transaction = {
        type: type,
        description: note || item,
        item: item,
        note: note,
        category: category,
        amount: signedAmount,
        date: dateValue || undefined
    };

    try {
        await DataManager.addTransaction(transaction);
        await initializeTables();
        closeModal();
    } catch (error) {
        console.error("Error:", error);
    }
}

async function deleteTransaction(id) {
    if (confirm("Eliminar esta transacción?")) {
        try {
            await DataManager.deleteTransaction(id);
            await initializeTables();
        } catch (error) {
            console.error("Error:", error);
        }
    }
}

function renderCategoryBadge(category, type) {
    const name = category || "Other";
    const slug = slugify(name) || "other";
    return `<span class="category-badge ${slug}" data-type="${type}">${name}</span>`;
}

function renderIncome() {
    const tbody = document.querySelector("#incomeTable tbody");
    $(tbody).empty();

    const list = filterTransactions(transactionsByType.income);
    list.forEach((t, index) => {
        const date = formatDate(t.date);
        const time = new Date(t.date).toLocaleTimeString();

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${t.item || t.description}</td>
            <td>${t.note || t.description || "-"}</td>
            <td>${renderCategoryBadge(t.category, "income")}</td>
            <td>${formatCurrency(t.amount)}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>
                <button class="delete-btn" data-id="${t.id}">🗑️</button>
            </td>
        `;
    });

    $("#incomeTable .delete-btn").on("click", e => {
        const id = Number($(e.currentTarget).data("id"));
        deleteTransaction(id);
    });
}

function renderExpense() {
    const tbody = document.querySelector("#expenseTable tbody");
    $(tbody).empty();

    const list = filterTransactions(transactionsByType.expense);
    list.forEach((t, index) => {
        const date = formatDate(t.date);
        const time = new Date(t.date).toLocaleTimeString();

        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${t.item || t.description}</td>
            <td>${t.note || t.description || "-"}</td>
            <td>${renderCategoryBadge(t.category, "expense")}</td>
            <td>${formatCurrency(Math.abs(t.amount))}</td>
            <td>${date}</td>
            <td>${time}</td>
            <td>
                <button class="delete-btn" data-id="${t.id}">🗑️</button>
            </td>
        `;
    });

    $("#expenseTable .delete-btn").on("click", e => {
        const id = Number($(e.currentTarget).data("id"));
        deleteTransaction(id);
    });
}

function updateBudgetWarning(expenseTotal) {
    const warning = $("#budgetWarning");
    if (state.budget > 0 && expenseTotal > state.budget) {
        warning
            .text(`Over budget: ${formatCurrency(expenseTotal)} / ${formatCurrency(state.budget)}`)
            .addClass("over-budget")
            .fadeIn(150);
    } else {
        warning.removeClass("over-budget").fadeOut(150);
    }
}

function setBudgetError(message) {
    const error = $("#budgetError");
    if (message) {
        error.text(message).fadeIn(150);
    } else {
        error.fadeOut(150);
    }
}

async function updateBalance() {
    const totals = await DataManager.calculateTotals();
    const incomeTotal = transactionsByType.income.reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = transactionsByType.expense.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    document.getElementById("incomeTotal").textContent = formatCurrency(incomeTotal);
    document.getElementById("expenseTotal").textContent = formatCurrency(expenseTotal);
    document.getElementById("sidebarBalance").textContent = formatCurrency(totals.total);

    updateBudgetWarning(expenseTotal);
}

function handleBudgetInput(value) {
    const cleaned = value.trim();
    if (!cleaned) {
        setBudgetError("");
        state.budget = 0;
        localStorage.removeItem("budget");
        const expenseTotal = transactionsByType.expense.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        updateBudgetWarning(expenseTotal);
        return;
    }

    const nextBudget = Number(cleaned);
    if (!Number.isFinite(nextBudget) || nextBudget < 0) {
        setBudgetError("Ingresa un presupuesto valido (numero mayor o igual a 0).");
        return;
    }

    setBudgetError("");
    state.budget = nextBudget;
    localStorage.setItem("budget", state.budget.toString());
    const expenseTotal = transactionsByType.expense.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    updateBudgetWarning(expenseTotal);
}

function handleFilterInput(value) {
    state.filterText = value.trim().toLowerCase();
    renderIncome();
    renderExpense();
}

function initializeUI() {
    const savedBudget = localStorage.getItem("budget");
    if (savedBudget) {
        const parsed = parseFloat(savedBudget);
        if (!Number.isNaN(parsed)) {
            state.budget = parsed;
            document.getElementById("budgetInput").value = parsed.toString();
        }
    }

    $("#addBtn").on("click", openModal);
    $("#saveBtn").on("click", addData);
    $("#cancelBtn").on("click", closeModal);
    $("#modal").on("click", e => {
        if (e.target.id === "modal") {
            closeModal();
        }
    });
    $("#budgetInput").on("input", e => handleBudgetInput(e.target.value));
    $("#filterInput").on("input", e => handleFilterInput(e.target.value));
}

window.addEventListener("load", () => {
    initializeUI();
    initializeTables();
});

window.addEventListener("transactionAdded", initializeTables);
window.addEventListener("transactionDeleted", initializeTables);
