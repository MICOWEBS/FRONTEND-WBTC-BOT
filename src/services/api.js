import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create an axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch current trading signal and metrics
 * @returns {Promise<Object>} Signal data
 */
export const fetchSignalData = async () => {
  try {
    const response = await api.get('/signal');
    return response.data;
  } catch (error) {
    console.error('Error fetching signal data:', error);
    throw error;
  }
};

/**
 * Fetch recent trading signals history
 * @returns {Promise<Array>} Array of recent signals
 */
export const fetchSignalHistory = async () => {
  try {
    const response = await api.get('/signal/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching signal history:', error);
    throw error;
  }
};

/**
 * Send signal notification to Telegram
 * @param {Object} signalData The signal data to send
 * @returns {Promise<Object>} Response from the Telegram API
 */
export const sendTelegramNotification = async (signalData) => {
  try {
    const response = await api.post('/send-telegram', signalData);
    return response.data;
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    throw error;
  }
};

/**
 * Fetch performance metrics data
 * @returns {Promise<Object>} Performance metrics
 */
export const fetchPerformanceData = async () => {
  try {
    const response = await api.get('/performance');
    return response.data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw error;
  }
};

/**
 * Fetch multi-timeframe analysis data
 * @returns {Promise<Object>} Multi-timeframe analysis
 */
export const fetchMultiTimeframeData = async () => {
  try {
    const response = await api.get('/multi-timeframe');
    return response.data;
  } catch (error) {
    console.error('Error fetching multi-timeframe data:', error);
    throw error;
  }
};

/**
 * Fetch position sizing data
 * @returns {Promise<Object>} Position sizing data
 */
export const fetchPositionSizeData = async () => {
  try {
    const response = await api.get('/position-size');
    return response.data;
  } catch (error) {
    console.error('Error fetching position size data:', error);
    throw error;
  }
};

/**
 * Fetch advanced signal data (combines multi-timeframe and position sizing)
 * @returns {Promise<Object>} Advanced signal data
 */
export const fetchAdvancedSignal = async () => {
  try {
    const response = await api.get('/advanced-signal');
    return response.data;
  } catch (error) {
    console.error('Error fetching advanced signal data:', error);
    throw error;
  }
};

export default api; 