/**
 * AlbionCalculate — Formatters
 * Number, silver, percentage, time formatting utilities
 */

/**
 * Format a number as silver with icon
 * @param {number} amount - Silver amount
 * @param {boolean} showSign - Show +/- sign
 * @returns {string} Formatted silver string
 */
export function formatSilver(amount, showSign = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const sign = showSign && amount > 0 ? '+' : '';
  const absAmount = Math.abs(amount);

  if (absAmount >= 1000000) {
    return `${sign}${(amount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 1000) {
    return `${sign}${(amount / 1000).toFixed(1)}K`;
  }
  return `${sign}${amount.toLocaleString()}`;
}

/**
 * Format silver with full number (no abbreviation)
 * @param {number} amount
 * @param {boolean} showSign
 * @returns {string}
 */
export function formatSilverFull(amount, showSign = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—';
  const sign = showSign && amount > 0 ? '+' : '';
  return `${sign}${Math.round(amount).toLocaleString()}`;
}

/**
 * Format as percentage
 * @param {number} value - Value between 0 and 1 (or 0-100)
 * @param {number} decimals - Decimal places
 * @returns {string}
 */
export function formatPercent(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '—';
  // If value looks like it's already in percentage (>1), don't multiply
  const pct = value > 1 ? value : value * 100;
  return `${pct.toFixed(decimals)}%`;
}

/**
 * Format time duration
 * @param {number} minutes - Duration in minutes
 * @returns {string}
 */
export function formatTime(minutes) {
  if (!minutes || minutes <= 0) return '—';
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Format hours
 * @param {number} hours
 * @returns {string}
 */
export function formatHours(hours) {
  if (!hours || hours === Infinity) return '∞';
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

/**
 * Get CSS class for profit/loss coloring
 * @param {number} value - Number to check
 * @returns {string} CSS class name
 */
export function profitClass(value) {
  if (value > 0) return 'profit';
  if (value < 0) return 'loss';
  return '';
}

/**
 * Get color for profit/loss
 * @param {number} value
 * @returns {string} Color hex
 */
export function profitColor(value) {
  if (value > 0) return '#10B981';
  if (value < 0) return '#EF4444';
  return '#94A3B8';
}

/**
 * Format a number with commas
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—';
  return Math.round(num).toLocaleString();
}

/**
 * Create a silver HTML span (with silver icon)
 * @param {number} amount
 * @param {boolean} colored - Apply profit/loss coloring
 * @returns {string} HTML string
 */
export function silverHTML(amount, colored = true) {
  const formatted = formatSilverFull(amount);
  const colorClass = colored ? profitClass(amount) : '';
  return `<span class="silver-value ${colorClass}">${formatted} <small style="opacity:0.6">⚙</small></span>`;
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 * @param {number} duration - ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
