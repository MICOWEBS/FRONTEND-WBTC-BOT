import { useState, useEffect, useRef } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:5000/ws';

const useSignalData = () => {
  const [signalData, setSignalData] = useState(null);
  const [signalHistory, setSignalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  // Function to load signal history
  const loadSignalHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/signal/history`);
      if (!response.ok) throw new Error('Failed to fetch signal history');
      const data = await response.json();
      setSignalHistory(data);
    } catch (err) {
      console.error('Error fetching signal history:', err);
      setError('Failed to load signal history. Please try again later.');
    }
  };

  // Function to fetch signal data via REST API (fallback)
  const fetchSignalData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/signal`);
      if (!response.ok) throw new Error('Failed to fetch signal data');
      const data = await response.json();
      setSignalData(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching signal data:', err);
      setError('Failed to load signal data. Please try again later.');
      setLoading(false);
    }
  };

  // Function to send a Telegram notification
  const sendTelegramNotification = async () => {
    if (!signalData) return false;
    
    try {
      const response = await fetch(`${API_URL}/api/send-telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signalData)
      });
      
      const result = await response.json();
      return result.success;
    } catch (err) {
      console.error('Error sending Telegram notification:', err);
      return false;
    }
  };

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
      
      // Close existing connection if any
      if (wsRef.current) {
        wsRef.current.close();
      }
      
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;
      
      // Connection opened
      ws.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        setError(null);
      };
      
      // Listen for messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setSignalData(data);
          setLoading(false);
          
          // If we receive a BUY or SELL signal, refresh the history
          if (data.signal === 'BUY' || data.signal === 'SELL') {
            loadSignalHistory();
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };
      
      // Connection closed
      ws.onclose = (event) => {
        console.log('WebSocket connection closed', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (document.visibilityState !== 'hidden') {
            connectWebSocket();
          }
        }, 3000);
      };
      
      // Connection error
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('WebSocket connection error. Falling back to REST API.');
        ws.close();
        
        // Fallback to REST API
        fetchSignalData();
      };
    };
    
    // Initial connection
    connectWebSocket();
    
    // Load signal history initially
    loadSignalHistory();
    
    // Reconnect WebSocket when tab becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)) {
        connectWebSocket();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    signalData,
    signalHistory,
    loading,
    error,
    isConnected,
    sendTelegramNotification,
    refreshHistory: loadSignalHistory
  };
};

export default useSignalData; 