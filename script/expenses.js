// JSON 
let data = {
    project: {
        name: "Income & Expense Tracker",
        createdAt: "2026-01-02"
    },
    income: [],
    expense: []
};

// MODAL 
function openModal() {
    document.getElementById("modal").style.display = "flex";
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// RENDER
function renderTable(type) {
    const tbody = document.querySelector(`#${type}Table tbody`);
    tbody.innerHTML = "";

    data[type].forEach((item, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.item}</td>
            <td>${item.description}</td>
            <td>${item.mode}</td>
            <td>${item.quantity }</td>
            <td>${item.day}</td>
            <td>${item.time}</td>
            <td>
                <button class="delete-btn" onclick="deleteItem('${type}', ${item.id})">🗑️</button>
            </td>
        `;
    });

    updateTotals(); // 🔥 actualizar totales
}


// ADD
function addData() {
    const type = document.getElementById("type").value;
    const item = document.getElementById("item").value;
    const desc = document.getElementById("desc").value;
    const qty = document.getElementById("qty").value;

    if (!item) {
        alert("Completa el campo Item");
        return;
    }

    const now = new Date();
    const newItem = {
        id: Date.now(),
        item: item,
        description: desc,
        mode: "Cash",
        quantity: qty,
        day: now.toLocaleDateString(),
        time: now.toLocaleTimeString()
    };

    data[type].push(newItem);
    renderTable(type);

    document.getElementById("item").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("qty").value = "";
    closeModal();
}

// DELETE
function deleteItem(type, id) {
    data[type] = data[type].filter(item => item.id !== id);
    renderTable(type);
}

// TABLE
renderTable("income");
renderTable("expense");

function updateTotals() {
    const incomeTotal = data.income.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    const expenseTotal = data.expense.reduce(
        (sum, item) => sum + Number(item.quantity),
        0
    );

    document.getElementById("incomeTotal").innerText = incomeTotal;
    document.getElementById("expenseTotal").innerText = expenseTotal;
}

