let pieChart, barChart, lineChart;

async function updateDashboard() {
    const totals = await DataManager.calculateTotals();
    const transactions = await DataManager.getTransactions();

    document.getElementById('incomeCard').textContent = formatCurrency(totals.income);
    document.getElementById('expenseCard').textContent = formatCurrency(totals.expenses);
    document.getElementById('savingsCard').textContent = formatCurrency(totals.savings);

    const totalBalance = totals.total;
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance);
    document.getElementById('sidebarBalance').textContent = formatCurrency(totalBalance);

    const tableBody = document.getElementById('transactionsBody');
    
    if (transactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <p>No transactions yet. Add one from the Expenses page.</p>
                </td>
            </tr>
        `;
    } else {
        const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        tableBody.innerHTML = sorted.map(t => `
            <tr>
                <td>${t.date}</td>
                <td>${t.description}</td>
                <td>${t.category}</td>
                <td class="${t.type === 'income' ? 'amount-positive' : 'amount-negative'}">
                    ${t.type === 'income' ? '+' : '-'}${formatCurrency(Math.abs(t.amount))}
                </td>
            </tr>
        `).join('');
    }

    updateCharts(transactions, totals);
}

async function updateCharts(transactions, totals) {
    updatePieChart(totals);
    updateBarChart(transactions);
    updateLineChart(transactions);
}

function updatePieChart(totals) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (pieChart) {
        pieChart.destroy();
    }

    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [totals.income, totals.expenses],
                backgroundColor: ['#2ecc71', '#e74c3c'],
                borderColor: ['#27ae60', '#c0392b'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12, weight: '500' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 }
                }
            }
        }
    });
}

function updateBarChart(transactions) {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    const categories = {};
    transactions.forEach(t => {
        const cat = t.category || 'Other';
        if (!categories[cat]) {
            categories[cat] = { income: 0, expense: 0 };
        }
        if (t.type === 'income') {
            categories[cat].income += t.amount;
        } else {
            categories[cat].expense += Math.abs(t.amount);
        }
    });

    const labels = Object.keys(categories);
    const incomeData = labels.map(cat => categories[cat].income);
    const expenseData = labels.map(cat => categories[cat].expense);

    if (barChart) {
        barChart.destroy();
    }

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: '#2ecc71',
                    borderColor: '#27ae60',
                    borderWidth: 1,
                    borderRadius: 5
                },
                {
                    label: 'Expense',
                    data: expenseData,
                    backgroundColor: '#e74c3c',
                    borderColor: '#c0392b',
                    borderWidth: 1,
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12, weight: '500' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateLineChart(transactions) {
    const ctx = document.getElementById('lineChart').getContext('2d');
    
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let balance = 0;
    const dates = [];
    const balances = [];
    
    sorted.forEach(t => {
        balance += t.amount;
        if (!dates.includes(t.date)) {
            dates.push(t.date);
            balances.push(balance);
        } else {
            balances[balances.length - 1] = balance;
        }
    });

    if (lineChart) {
        lineChart.destroy();
    }

    lineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Balance Over Time',
                data: balances,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.08)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#3498db',
                pointBorderColor: '#2980b9',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12, weight: '500' },
                        padding: 15,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: 12,
                    titleFont: { size: 13 },
                    bodyFont: { size: 12 },
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        font: { size: 11 }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}

updateDashboard();
window.addEventListener('transactionAdded', updateDashboard);
window.addEventListener('transactionDeleted', updateDashboard);
setInterval(updateDashboard, 5000);
