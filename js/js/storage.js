/**
 * ==========================================
 * STORAGE.JS - Manajemen LocalStorage
 * ==========================================
 */

const Storage = {
    KEYS: {
        EXPENSES: 'expense_tracker_data',
        BUDGET: 'expense_tracker_budget',
        THEME: 'expense_tracker_theme'
    },

    /**
     * Simpan semua pengeluaran
     * @param {Array} expenses - Array pengeluaran
     */
    saveExpenses(expenses) {
        try {
            localStorage.setItem(this.KEYS.EXPENSES, JSON.stringify(expenses));
        } catch (e) {
            console.error('Gagal menyimpan data:', e);
        }
    },

    /**
     * Ambil semua pengeluaran
     * @returns {Array} Array pengeluaran
     */
    getExpenses() {
        try {
            const data = localStorage.getItem(this.KEYS.EXPENSES);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Gagal membaca data:', e);
            return [];
        }
    },

    /**
     * Tambah pengeluaran baru
     * @param {Object} expense - Data pengeluaran
     * @returns {Object} Pengeluaran yang sudah ditambah
     */
    addExpense(expense) {
        const expenses = this.getExpenses();
        const newExpense = {
            id: Utils.generateId(),
            date: expense.date,
            amount: Number(expense.amount),
            category: expense.category,
            note: expense.note || '',
            createdAt: new Date().toISOString()
        };
        expenses.push(newExpense);
        this.saveExpenses(expenses);
        return newExpense;
    },

    /**
     * Hapus pengeluaran berdasarkan ID
     * @param {string} id - ID pengeluaran
     */
    deleteExpense(id) {
        let expenses = this.getExpenses();
        expenses = expenses.filter(e => e.id !== id);
        this.saveExpenses(expenses);
    },

    /**
     * Ambil pengeluaran berdasarkan bulan & tahun
     * @param {number} year - Tahun
     * @param {number} month - Bulan (0-11)
     * @returns {Array} Array pengeluaran bulan tersebut
     */
    getExpensesByMonth(year, month) {
        const expenses = this.getExpenses();
        return expenses.filter(e => {
            const date = new Date(e.date + 'T00:00:00');
            return date.getFullYear() === year && date.getMonth() === month;
        });
    },

    /**
     * Simpan budget bulanan
     * @param {number} year - Tahun
     * @param {number} month - Bulan
     * @param {number} amount - Jumlah budget
     */
    saveBudget(year, month, amount) {
        try {
            const budgets = this.getAllBudgets();
            const key = `${year}-${month}`;
            budgets[key] = Number(amount);
            localStorage.setItem(this.KEYS.BUDGET, JSON.stringify(budgets));
        } catch (e) {
            console.error('Gagal menyimpan budget:', e);
        }
    },

    /**
     * Ambil budget bulanan
     * @param {number} year - Tahun
     * @param {number} month - Bulan
     * @returns {number} Jumlah budget
     */
    getBudget(year, month) {
        try {
            const budgets = this.getAllBudgets();
            const key = `${year}-${month}`;
            return budgets[key] || 0;
        } catch (e) {
            return 0;
        }
    },

    /**
     * Ambil semua budget
     * @returns {Object} Object budget
     */
    getAllBudgets() {
        try {
            const data = localStorage.getItem(this.KEYS.BUDGET);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    },

    /**
     * Simpan preferensi tema
     * @param {string} theme - 'light' atau 'dark'
     */
    saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    },

    /**
     * Ambil preferensi tema
     * @returns {string} 'light' atau 'dark'
     */
    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'light';
    },

    /**
     * Export data ke JSON
     * @returns {string} JSON string
     */
    exportData() {
        const data = {
            expenses: this.getExpenses(),
            budgets: this.getAllBudgets(),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        return JSON.stringify(data, null, 2);
    },

    /**
     * Import data dari JSON
     * @param {string} jsonStr - JSON string
     * @returns {boolean} Berhasil atau tidak
     */
    importData(jsonStr) {
        try {
            const data = JSON.parse(jsonStr);
            if (data.expenses) this.saveExpenses(data.expenses);
            if (data.budgets) {
                localStorage.setItem(this.KEYS.BUDGET, JSON.stringify(data.budgets));
            }
            return true;
        } catch (e) {
            console.error('Gagal import data:', e);
            return false;
        }
    },

    /**
     * Hapus semua data
     */
    clearAll() {
        localStorage.removeItem(this.KEYS.EXPENSES);
        localStorage.removeItem(this.KEYS.BUDGET);
    }
};
