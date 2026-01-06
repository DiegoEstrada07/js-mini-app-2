// Shared Data Manager - Uses server backend
const API_URL = 'http://localhost:3000/api';

const DataManager = {
    // Get all transactions from server
    async getTransactions() {
        try {
            const response = await fetch(`${API_URL}/transactions`);
            if (!response.ok) throw new Error('Failed to fetch transactions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
    },

    // Add new transaction to server
    async addTransaction(transaction) {
        try {
            const response = await fetch(`${API_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transaction)
            });
            if (!response.ok) throw new Error('Failed to add transaction');
            const newTransaction = await response.json();
            // Trigger update event
            window.dispatchEvent(new CustomEvent('transactionAdded', { detail: newTransaction }));
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            alert('Error al guardar la transacción. ¿El servidor está corriendo?');
            throw error;
        }
    },

    // Delete transaction from server
    async deleteTransaction(id) {
        try {
            const response = await fetch(`${API_URL}/transactions/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete transaction');
            await response.json();
            // Trigger update event
            window.dispatchEvent(new CustomEvent('transactionDeleted', { detail: { id } }));
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Error al eliminar la transacción');
            throw error;
        }
    },

    // Calculate totals from server
    async calculateTotals() {
        try {
            const response = await fetch(`${API_URL}/totals`);
            if (!response.ok) throw new Error('Failed to fetch totals');
            return await response.json();
        } catch (error) {
            console.error('Error fetching totals:', error);
            return { income: 0, expenses: 0, savings: 0, total: 0 };
        }
    },

    // Get transactions by type
    async getTransactionsByType(type) {
        const transactions = await this.getTransactions();
        return transactions.filter(t => t.type === type);
    },

    // Get transactions by date range
    async getTransactionsByDateRange(startDate, endDate) {
        const transactions = await this.getTransactions();
        return transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= new Date(startDate) && tDate <= new Date(endDate);
        });
    }
};

// Utility function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Utility function to format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}
