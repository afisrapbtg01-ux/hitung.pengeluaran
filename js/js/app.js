/**
 * ==========================================
 * APP.JS - Logika Utama Aplikasi
 * ==========================================
 */

const App = {
    // State
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    deleteTargetId: null,

    /**
     * Inisialisasi aplikasi
     */
    init() {
        this.loadTheme();
        this.setDefaultDate();
        this.bindEvents();
        this.render();
    },

    /**
     * Load tema dari storage
     */
    loadTheme() {
        const theme = Storage.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        document.getElementById('themeIcon').textContent = theme === 'dark' ? '☀️' : '🌙';
    },

    /**
     * Set tanggal default ke hari ini
     */
    setDefaultDate() {
        const dateInput = document.getElementById('expenseDate');
        dateInput.value = Utils.getToday();
    },

    /**
     * Bind semua event listeners
     */
    bindEvents() {
        // Form submit
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addExpense();
        });

        // Navigasi bulan
        document.getElementById('btnPrevMonth').addEventListener('click', () => this.changeMonth(-1));
        document.getElementById('btnNextMonth').addEventListener('click', () => this.changeMonth(1));

        // Tema
        document.getElementById('btnTheme').addEventListener('click', () => this.toggleTheme());

        // Export
        document.getElementById('btnExport').addEventListener('click', () => this.exportData());

        // Budget modal
        document.getElementById('btnEditBudget').addEventListener('click', () => this.openBudgetModal());
        document.getElementById('btnCloseBudget').addEventListener('click', () => this.closeBudgetModal());
        document.getElementById('btnCancelBudget').addEventListener('click', () => this.closeBudgetModal());
        document.getElementById('btnSaveBudget').addEventListener('click', () => this.saveBudget());

        // Delete modal
        document.getElementById('btnCloseDelete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('btnCancelDelete').addEventListener('click', () => this.closeDeleteModal());
        document.getElementById('btnConfirmDelete').addEventListener('click', () => this.confirmDelete());

        // Search & Filter
        document.getElementById('searchExpense').addEventListener('input', 
            Utils.debounce(() => this.renderExpenseList(), 300));
        document.getElementById('filterCategory').addEventListener('change', () => this.renderExpenseList());
        document.getElementById('sortBy').addEventListener('change', () => this.renderExpenseList());

        // Close modal saat klik overlay
        document.getElementById('budgetModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeBudgetModal();
        });
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeDeleteModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeBudgetModal();
                this.closeDeleteModal();
            }
        });

        // Resize chart
        window.addEventListener('resize', Utils.debounce(() => {
            this.renderCharts();
        }, 250));
    },

    /**
     * Render semua komponen
     */
    render() {
        this.renderMonthTitle();
        this.renderSummary();
        this.renderCategories();
        this.renderCharts();
        this.renderExpenseList();
        this.renderCalendar();
    },

    /**
     * Ubah bulan
     * @param {number} delta - +1 atau -1
     */
    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.render();
    },

    /**
     * Render judul bulan
     */
    renderMonthTitle() {
        const title = `${Utils.getMonthName(this.currentMonth)} ${this.currentYear}`;
        document.getElementById('monthTitle').textContent = title;
    },

    /**
     * Render kartu ringkasan
     */
    renderSummary() {
        const expenses = Storage.getExpensesByMonth(this.currentYear, this.currentMonth);
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const budget = Storage.getBudget(this.currentYear, this.currentMonth);
        const remaining = budget - totalSpent;
        const daysInMonth = Utils.getDaysInMonth(this.currentYear, this.currentMonth);
        const today = new Date();
        const daysPassed = (this.currentYear === today.getFullYear() && this.currentMonth === today.getMonth())
            ? today.getDate()
            : daysInMonth;
        const dailyAvg = daysPassed > 0 ? totalSpent / daysPassed : 0;

        // Update cards
        document.getElementById('totalBudget').textContent = Utils.formatRupiah(budget);
        document.getElementById('totalSpent').textContent = Utils.formatRupiah(totalSpent);
        document.getElementById('totalRemaining').textContent = Utils.formatRupiah(remaining);
        document.getElementById('dailyAvg').textContent = Utils.formatRupiah(Math.round(dailyAvg));

        // Update progress bar
        const percent = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
        const progressFill = document.getElementById('progressFill');
        progressFill.style.width = percent + '%';

        // Warna progress
        progressFill.className = 'progress-fill';
        if (percent > 90) progressFill.classList.add('danger');
        else if (percent > 70) progressFill.classList.add('warning');

        document.getElementById('progressPercent').textContent = percent.toFixed(1) + '%';
        document.getElementById('progressSpentLabel').textContent = Utils.formatRupiah(totalSpent) + ' terpakai';
        document.getElementById('progressBudgetLabel').textContent = 'dari ' + Utils.formatRupiah(budget);
    },

    /**
     * Render kategori
     */
    renderCategories() {
        const expenses = Storage.getExpensesByMonth(this.currentYear, this.currentMonth);
        const categoryTotals = {};

        expenses.forEach(e => {
            if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
            categoryTotals[e.category] += e.amount;
        });

        const grid = document.getElementById('categoryGrid');
        const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

        if (categories.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align:center; padding: 20px;">Belum ada pengeluaran bulan ini</p>';
            return;
        }

        grid.innerHTML = categories.map(([category, amount]) => `
            <div class="category-item">
                <div class="category-emoji">${Utils.getCategoryEmoji(category)}</div>
                <div class="category-details">
                    <div class="category-name">${Utils.getCategoryName(category)}</div>
                    <div class="category-amount">${Utils.formatRupiah(amount)}</div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render grafik
     */
    renderCharts() {
        const expenses = Storage.getExpensesByMonth(this.currentYear, this.currentMonth);
        Chart.drawBarChart('dailyChart', expenses, this.currentYear, this.currentMonth);
        Chart.drawPieChart('pieChart', expenses);
    },

    /**
     * Render daftar pengeluaran
     */
    renderExpenseList() {
        let expenses = Storage.getExpensesByMonth(this.currentYear, this.currentMonth);

        // Filter
        const search = document.getElementById('searchExpense').value.toLowerCase();
        const filterCat = document.getElementById('filterCategory').value;
        const sortBy = document.getElementById('sortBy').value;

        if (search) {
            expenses = expenses.filter(e =>
                e.note.toLowerCase().includes(search) ||
                Utils.getCategoryName(e.category).toLowerCase().includes(search)
            );
        }

        if (filterCat !== 'all') {
            expenses = expenses.filter(e => e.category === filterCat);
        }

        // Sort
        switch (sortBy) {
            case 'date-desc':
                expenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc':
                expenses.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'amount-desc':
                expenses.sort((a, b) => b.amount - a.amount);
                break;
            case 'amount-asc':
                expenses.sort((a, b) => a.amount - b.amount);
                break;
        }

        const list = document.getElementById('expenseList');
        const empty = document.getElementById('listEmpty');

        if (expenses.length === 0) {
            list.innerHTML = '';
            empty.style.display = 'block';
            return;
        }

        empty.style.display = 'none';
        list.innerHTML = expenses.map(e => `
            <div class="expense-item" data-id="${e.id}">
                <div class="expense-emoji">${Utils.getCategoryEmoji(e.category)}</div>
                <div class="expense-details">
                    <div class="expense-note">${Utils.escapeHtml(e.note) || Utils.getCategoryName(e.category)}</div>
                    <div class="expense-meta">${Utils.formatDate(e.date)} • ${Utils.getCategoryName(e.category)}</div>
                </div>
                <div class="expense-amount">-${Utils.formatRupiah(e.amount)}</div>
                <button class="btn-delete" onclick="App.openDeleteModal('${e.id}')" title="Hapus">🗑️</button>
            </div>
        `).join('');
    },

    /**
     * Render kalender
     */
    renderCalendar() {
        const calendar = document.getElementById('calendar');
        const year = this.currentYear;
        const month = this.currentMonth;
        const daysInMonth = Utils.getDaysInMonth(year, month);
        const firstDay = Utils.getFirstDayOfMonth(year, month);
        const expenses = Storage.getExpensesByMonth(year, month);

        // Hitung total per hari
        const dailyTotals = {};
        expenses.forEach(e => {
            const day = new Date(e.date + 'T00:00:00').getDate();
            if (!dailyTotals[day]) dailyTotals[day] = 0;
            dailyTotals[day] += e.amount;
        });

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Header hari
        const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        let html = dayNames.map(d => `<div class="calendar-day-header">${d}</div>`).join('');

        // Empty cells sebelum hari pertama
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }

        // Hari-hari
        for (let day = 1; day <= daysInMonth; day++) {
            const hasExpense = dailyTotals[day] > 0;
            const isToday = isCurrentMonth && today.getDate() === day;
            const classes = ['calendar-day'];
            if (hasExpense) classes.push('has-expense');
            if (isToday) classes.push('today');

            const amountLabel = hasExpense
                ? `<span class="day-amount">${Utils.formatRupiah(dailyTotals[day]).replace('Rp ', '')}</span>`
                : '';

            html += `<div class="${classes.join(' ')}">${day}${amountLabel}</div>`;
        }

        calendar.innerHTML = html;
    },

    /**
     * Tambah pengeluaran baru
     */
    addExpense() {
        const date = document.getElementById('expenseDate').value;
        const amount = document.getElementById('expenseAmount').value;
        const category = document.getElementById('expenseCategory').value;
        const note = document.getElementById('expenseNote').value;

        if (!date || !amount || !category) {
            this.showToast('⚠️ Mohon lengkapi semua field yang wajib!', 'warning');
            return;
        }

        if (Number(amount) <= 0) {
            this.showToast('⚠️ Jumlah harus lebih dari 0!', 'warning');
            return;
        }

        Storage.addExpense({ date, amount, category, note });

        // Reset form
        document.getElementById('expenseAmount').value = '';
        document.getElementById('expenseCategory').value = '';
        document.getElementById('expenseNote').value = '';

        // Update tampilan
        this.render();
        this.showToast('✅ Pengeluaran berhasil ditambahkan!', 'success');
    },

    /**
     * Toggle tema
     */
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        Storage.saveTheme(newTheme);
        document.getElementById('themeIcon').textContent = newTheme === 'dark' ? '☀️' : '🌙';

        // Re-render charts dengan warna baru
        setTimeout(() => this.renderCharts(), 100);
    },

    /**
     * Export data
     */
    exportData() {
        const data = Storage.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expense-tracker-${Utils.getToday()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('📥 Data berhasil di-export!', 'success');
    },

    /**
     * Buka modal budget
     */
    openBudgetModal() {
        const budget = Storage.getBudget(this.currentYear, this.currentMonth);
        document.getElementById('budgetInput').value = budget || '';
        document.getElementById('budgetModal').classList.add('active');
    },

    /**
     * Tutup modal budget
     */
    closeBudgetModal() {
        document.getElementById('budgetModal').classList.remove('active');
    },

    /**
     * Simpan budget
     */
    saveBudget() {
        const amount = document.getElementById('budgetInput').value;
        if (!amount || Number(amount) < 0) {
            this.showToast('⚠️ Masukkan budget yang valid!', 'warning');
            return;
        }
        Storage.saveBudget(this.currentYear, this.currentMonth, amount);
        this.closeBudgetModal();
        this.render();
        this.showToast('✅ Budget berhasil disimpan!', 'success');
    },

    /**
     * Buka modal konfirmasi hapus
     * @param {string} id - ID pengeluaran
     */
    openDeleteModal(id) {
        this.deleteTargetId = id;
        document.getElementById('deleteModal').classList.add('active');
    },

    /**
     * Tutup modal hapus
     */
    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('active');
        this.deleteTargetId = null;
    },

    /**
     * Konfirmasi hapus
     */
    confirmDelete() {
        if (this.deleteTargetId) {
            Storage.deleteExpense(this.deleteTargetId);
            this.closeDeleteModal();
            this.render();
            this.showToast('🗑️ Pengeluaran berhasil dihapus!', 'success');
        }
    },

    /**
     * Tampilkan toast notification
     * @param {string} message - Pesan
     * @param {string} type - 'success', 'error', 'warning'
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 3000);
    }
};

// ===== MULAI APLIKASI =====
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
