import { format, parseISO } from 'date-fns';

/**
 * Format price with thousand separators and 2 decimal places
 * @param {number} price - The price to format
 * @returns {string} Formatted price
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Format percentage with 2 decimal places and % sign
 * @param {number} percent - The percentage to format
 * @returns {string} Formatted percentage
 */
export const formatPercent = (percent) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(percent / 100);
};

/**
 * Format date to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  try {
    return format(parseISO(dateString), 'MMM d, yyyy HH:mm:ss');
  } catch (error) {
    return dateString;
  }
};

/**
 * Format RSI value with 1 decimal place
 * @param {number} rsi - RSI value
 * @returns {string} Formatted RSI
 */
export const formatRSI = (rsi) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rsi);
};

/**
 * Get signal display information
 * @param {string} signal - Signal type (BUY, SELL, HOLD, or WAIT)
 * @returns {Object} Signal display information
 */
export const getSignalInfo = (signal) => {
  const signalUpper = signal?.toUpperCase();
  
  switch (signalUpper) {
    case 'BUY':
      return {
        class: 'signal-buy',
        text: 'BUY',
        indicator: '💰',
        description: 'Entry signal detected! Good time to buy.',
      };
    case 'SELL':
      return {
        class: 'signal-sell',
        text: 'SELL',
        indicator: '💸',
        description: 'Exit signal detected! Time to take profit.',
      };
    case 'HOLD':
      return {
        class: 'signal-hold',
        text: 'HOLD',
        indicator: '🔒',
        description: 'Hold your position and wait.',
      };
    default:
      return {
        class: 'signal-wait',
        text: 'WAITING',
        indicator: '⏳',
        description: 'Monitoring market conditions...',
      };
  }
}; 