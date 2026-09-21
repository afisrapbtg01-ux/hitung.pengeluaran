/**
 * ==========================================
 * CHART.JS - Grafik Pengeluaran (Pure Canvas)
 * Tanpa library eksternal!
 * ==========================================
 */

const Chart = {
    /**
     * Gambar grafik batang (bar chart) pengeluaran harian
     * @param {string} canvasId - ID canvas element
     * @param {Array} expenses - Array pengeluaran bulan ini
     * @param {number} year - Tahun
     * @param {number} month - Bulan (0-11)
     */
    drawBarChart(canvasId, expenses, year, month) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Set canvas size
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Hitung total per hari
        const daysInMonth = Utils.getDaysInMonth(year, month);
        const dailyTotals = new Array(daysInMonth).fill(0);

        expenses.forEach(e => {
            const day = new Date(e.date + 'T00:00:00').getDate();
            dailyTotals[day - 1] += e.amount;
        });

        const maxVal = Math.max(...dailyTotals, 1);

        // Padding
        const padding = { top: 30, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        // Get theme colors
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const textColor = isDark ? '#94a3b8' : '#4a5568';
        const gridColor = isDark ? '#334155' : '#e2e8f0';

        // Gambar grid lines
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.5;
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (chartHeight / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(width - padding.right, y);
            ctx.stroke();

            // Label Y axis
            const value = maxVal - (maxVal / gridLines) * i;
            ctx.fillStyle = textColor;
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(this._formatShort(value), padding.left - 8, y + 4);
        }

        // Gambar bars
        const barWidth = Math.max((chartWidth / daysInMonth) - 2, 3);
        const gap = (chartWidth - barWidth * daysInMonth) / (daysInMonth);

        dailyTotals.forEach((total, index) => {
            const barHeight = (total / maxVal) * chartHeight;
            const x = padding.left + index * (barWidth + gap) + gap / 2;
            const y = padding.top + chartHeight - barHeight;

            // Gradient bar
            const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');

            ctx.fillStyle = total > 0 ? gradient : 'transparent';
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, [3, 3, 0, 0]);
            ctx.fill();

            // Label X axis (setiap 5 hari)
            if ((index + 1) % 5 === 0 || index === 0 || index === daysInMonth - 1) {
                ctx.fillStyle = textColor;
                ctx.font = '10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(index + 1, x + barWidth / 2, height - padding.bottom + 16);
            }
        });

        // Title
        ctx.fillStyle = textColor;
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Pengeluaran Harian', width / 2, 16);
    },

    /**
     * Gambar grafik pie (distribusi kategori)
     * @param {string} canvasId - ID canvas element
     * @param {Array} expenses - Array pengeluaran
     */
    drawPieChart(canvasId, expenses) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = 280 * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = '280px';
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = 280;

        ctx.clearRect(0, 0, width, height);

        // Hitung total per kategori
        const categoryTotals = {};
        expenses.forEach(e => {
            if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
            categoryTotals[e.category] += e.amount;
        });

        const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
        const total = categories.reduce((sum, [, val]) => sum + val, 0);

        if (total === 0) {
            ctx.fillStyle = '#a0aec0';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Belum ada data', width / 2, height / 2);
            return;
        }

        // Pie chart dimensions
        const centerX = width / 2;
        const centerY = height / 2 - 20;
        const radius = Math.min(width, height) / 2 - 50;

        let startAngle = -Math.PI / 2;

        categories.forEach(([category, amount]) => {
            const sliceAngle = (amount / total) * 2 * Math.PI;
            const endAngle = startAngle + sliceAngle;

            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = Utils.getCategoryColor(category);
            ctx.fill();

            // White border
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Label
            const midAngle = startAngle + sliceAngle / 2;
            const labelRadius = radius + 20;
            const labelX = centerX + Math.cos(midAngle) * labelRadius;
            const labelY = centerY + Math.sin(midAngle) * labelRadius;

            const percentage = ((amount / total) * 100).toFixed(1);
            if (percentage > 5) {
                ctx.fillStyle = '#4a5568';
                ctx.font = 'bold 11px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText(`${percentage}%`, labelX, labelY);
            }

            startAngle = endAngle;
        });

        // Legend
        const legendY = height - 30;
        const legendItemWidth = width / Math.min(categories.length, 4);

        categories.forEach(([category, amount], index) => {
            const row = Math.floor(index / 4);
            const col = index % 4;
            const x = col * legendItemWidth + 10;
            const y = legendY + row * 18;

            ctx.fillStyle = Utils.getCategoryColor(category);
            ctx.fillRect(x, y, 10, 10);

            ctx.fillStyle = '#4a5568';
            ctx.font = '10px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(Utils.getCategoryName(category), x + 14, y + 9);
        });
    },

    /**
     * Format angka pendek (1000 -> 1K)
     * @param {number} value - Nilai
     * @returns {string} Format pendek
     */
    _formatShort(value) {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(0) + 'K';
        return value.toFixed(0);
    }
};

// Polyfill untuk roundRect
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
        const r = radii[0] || 0;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        this.closePath();
        return this;
    };
}
