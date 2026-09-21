/**
 * ==========================================
 * UTILS.JS - Fungsi-fungsi Utilitas
 * ==========================================
 */

const Utils = {
    /**
     * Format angka ke format Rupiah
     * @param {number} amount - Jumlah uang
     * @returns {string} Format Rupiah
     */
    formatRupiah(amount) {
        return 'Rp ' + Number(amount).toLocaleString('id-ID');
    },

    /**
     * Format tanggal ke format Indonesia
     * @param {string} dateStr - String tanggal (YYYY-MM-DD)
     * @returns {string} Format tanggal Indonesia
     */
    formatDate(dateStr) {
        const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('id-ID', options);
    },

    /**
     * Format tanggal pendek
     * @param {string} dateStr - String tanggal
     * @returns {string} Format pendek
     */
    formatDateShort(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    },

    /**
     * Dapatkan nama bulan dalam Bahasa Indonesia
     * @param {number} month - Index bulan (0-11)
     * @returns {string} Nama bulan
     */
    getMonthName(month) {
        const months = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return months[month];
    },

    /**
     * Dapatkan jumlah hari dalam bulan
     * @param {number} year - Tahun
     * @param {number} month - Bulan (0-11)
     * @returns {number} Jumlah hari
     */
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },

    /**
     * Dapatkan hari pertama dalam bulan (0=Minggu, 6=Sabtu)
     * @param {number} year - Tahun
     * @param {number} month - Bulan (0-11)
     * @returns {number} Index hari
     */
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },

    /**
     * Generate unique ID
     * @returns {string} Unique ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Dapatkan tanggal hari ini dalam format YYYY-MM-DD
     * @returns {string} Tanggal hari ini
     */
    getToday() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * Emoji untuk kategori
     * @param {string} category - Nama kategori
     * @returns {string} Emoji
     */
    getCategoryEmoji(category) {
        const emojis = {
            makanan: '🍔',
            transportasi: '🚗',
            belanja: '🛒',
            tagihan: '📄',
            hiburan: '🎮',
            kesehatan: '💊',
            pendidikan: '📚',
            tabungan: '🏦',
            lainnya: '📦'
        };
        return emojis[category] || '📦';
    },

    /**
     * Nama kategori yang mudah dibaca
     * @param {string} category - Key kategori
     * @returns {string} Nama kategori
     */
    getCategoryName(category) {
        const names = {
            makanan: 'Makanan & Minuman',
            transportasi: 'Transportasi',
            belanja: 'Belanja',
            tagihan: 'Tagihan & Utilitas',
            hiburan: 'Hiburan',
            kesehatan: 'Kesehatan',
            pendidikan: 'Pendidikan',
            tabungan: 'Tabungan',
            lainnya: 'Lainnya'
        };
        return names[category] || 'Lainnya';
    },

    /**
     * Warna untuk kategori
     * @param {string} category - Key kategori
     * @returns {string} Warna hex
     */
    getCategoryColor(category) {
        const colors = {
            makanan: '#f56565',
            transportasi: '#4299e1',
            belanja: '#ed8936',
            tagihan: '#9f7aea',
            hiburan: '#38b2ac',
            kesehatan: '#48bb78',
            pendidikan: '#667eea',
            tabungan: '#ecc94b',
            lainnya: '#a0aec0'
        };
        return colors[category] || '#a0aec0';
    },

    /**
     * Debounce function
     * @param {Function} func - Fungsi
     * @param {number} wait - Waktu tunggu (ms)
     * @returns {Function}
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Escape HTML untuk keamanan
     * @param {string} text - Teks
     * @returns {string} Teks yang sudah di-escape
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};
