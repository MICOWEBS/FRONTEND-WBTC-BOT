import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Activity, RefreshCw, AlertTriangle, Trending, TrendingUp, TrendingDown, Send, TrendingUp as PerformanceIcon, BarChart2, Layers } from 'react-feather';
import SignalCard from './SignalCard';
import MetricCard from './MetricCard';
import SignalHistoryCard from './SignalHistoryCard';
import LoadingSpinner from './LoadingSpinner';
import BitcoinPriceChart from './BitcoinPriceChart';
import { fetchSignalData, fetchSignalHistory, sendTelegramNotification, fetchPerformanceData, fetchAdvancedSignal } from '../services/api';
import { formatPrice, formatPercent, formatRSI } from '../utils/formatters';

/**
 * Main dashboard component
 */
const Dashboard = () => {
  const [signalData, setSignalData] = useState(null);
  const [signalHistory, setSignalHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSignal, setLastSignal] = useState(null);
  const [livePriceData, setLivePriceData] = useState([]);
  const [priceChange, setPriceChange] = useState({ value: 0, isPositive: false });
  const [performanceData, setPerformanceData] = useState(null);
  const [advancedData, setAdvancedData] = useState(null);

  // Fetch signal data from API
  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const data = await fetchSignalData();
      setSignalData(data);
      
      // Update live price data array
      if (data && data.binancePrice) {
        setLivePriceData(prevData => {
          // Keep only the last 20 price points
          const newData = [...prevData, {
            time: new Date(),
            price: data.binancePrice
          }].slice(-20);
          
          // Calculate price change
          if (newData.length >= 2) {
            const latestPrice = newData[newData.length - 1].price;
            const previousPrice = newData[newData.length - 2].price;
            const change = ((latestPrice - previousPrice) / previousPrice) * 100;
            setPriceChange({
              value: Math.abs(change),
              isPositive: change >= 0
            });
          }
          
          return newData;
        });
      }
      
      // Check if signal has changed
      if (lastSignal && lastSignal !== data.signal && (data.signal === 'BUY' || data.signal === 'SELL')) {
        // Send Telegram notification for new signal
        await sendTelegramNotification(data);
      }
      
      setLastSignal(data.signal);
      setError(null);
    } catch (err) {
      setError('Failed to fetch signal data');
      console.error(err);
    } finally {
      setRefreshing(false);
    }
  }, [lastSignal]);

  // Fetch signal history
  const fetchHistory = useCallback(async () => {
    try {
      const history = await fetchSignalHistory();
      setSignalHistory(history);
    } catch (err) {
      console.error('Failed to fetch signal history:', err);
    }
  }, []);

  // Fetch performance data
  const fetchPerformance = useCallback(async () => {
    try {
      const data = await fetchPerformanceData();
      setPerformanceData(data);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
    }
  }, []);

  // Fetch advanced signal data (multi-timeframe, position sizing)
  const fetchAdvanced = useCallback(async () => {
    try {
      const data = await fetchAdvancedSignal();
      setAdvancedData(data);
    } catch (err) {
      console.error('Failed to fetch advanced signal data:', err);
    }
  }, []);

  // Load data on component mount and set up interval
  useEffect(() => {
    // Initial load
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchData(), 
        fetchHistory(), 
        fetchPerformance(),
        fetchAdvanced()
      ]);
      setLoading(false);
    };
    
    loadData();
    
    // Set up auto-refresh interval (every 30 seconds)
    const intervalId = setInterval(() => {
      fetchData();
      fetchAdvanced();
      
      // Refresh other data less frequently
      if (Date.now() % (2 * 60 * 1000) < 30000) {
        fetchHistory();
        fetchPerformance();
      }
    }, 30000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [fetchData, fetchHistory, fetchPerformance, fetchAdvanced]);

  // Format for metrics cards
  const metrics = useMemo(() => {
    if (!signalData) return [];
    
    return [
      {
        title: 'RSI',
        value: formatRSI(signalData.rsi),
        className: signalData.rsi < 30 ? 'bg-green-50 border-l-4 border-green-400' : 
                 signalData.rsi > 70 ? 'bg-red-50 border-l-4 border-red-400' : '',
      },
      {
        title: 'EMA',
        value: formatPrice(signalData.ema),
      },
      {
        title: 'Binance Price',
        value: formatPrice(signalData.binancePrice),
      },
      {
        title: 'DEX Price',
        value: formatPrice(signalData.dexPrice),
      },
      {
        title: 'Spread',
        value: formatPercent(signalData.spread),
        className: signalData.spread > 0.5 ? 'bg-green-50 border-l-4 border-green-400' : 
                 signalData.spread < -0.5 ? 'bg-red-50 border-l-4 border-red-400' : '',
      },
    ];
  }, [signalData]);

  // Format for advanced metrics cards
  const advancedMetrics = useMemo(() => {
    if (!advancedData) return [];
    
    return [
      {
        title: 'Signal Strength',
        value: `${advancedData?.signal_strength?.toFixed(1)}%` || 'N/A',
        className: advancedData?.signal_strength > 70 ? 'bg-green-50 border-l-4 border-green-400' : 
                  advancedData?.signal_strength < 30 ? 'bg-yellow-50 border-l-4 border-yellow-400' : '',
      },
      {
        title: 'Confidence Score',
        value: `${advancedData?.confidence_score?.toFixed(1)}%` || 'N/A',
        className: advancedData?.confidence_score > 70 ? 'bg-green-50 border-l-4 border-green-400' : '',
      },
      {
        title: 'Volatility',
        value: `${advancedData?.volatility?.toFixed(2)}%` || 'N/A',
      },
      {
        title: 'Position Size',
        value: advancedData?.position_size ? formatPrice(advancedData.position_size) : 'N/A',
      },
    ];
  }, [advancedData]);

  // Format for performance metrics
  const performanceMetrics = useMemo(() => {
    if (!performanceData?.metrics) return [];
    
    const metrics = performanceData.metrics;
    
    return [
      {
        title: 'Win Rate',
        value: `${metrics.win_rate?.toFixed(1)}%` || 'N/A',
        className: metrics.win_rate > 50 ? 'bg-green-50 border-l-4 border-green-400' : '',
      },
      {
        title: 'Total P&L',
        value: formatPrice(metrics.total_profit_loss || 0),
        className: metrics.total_profit_loss > 0 ? 'bg-green-50 border-l-4 border-green-400' : 
                  metrics.total_profit_loss < 0 ? 'bg-red-50 border-l-4 border-red-400' : '',
      },
      {
        title: 'Trades',
        value: `${metrics.total_trades || 0}`,
      },
      {
        title: 'Sharpe Ratio',
        value: `${metrics.sharpe_ratio?.toFixed(2) || 'N/A'}`,
        className: metrics.sharpe_ratio > 1 ? 'bg-green-50 border-l-4 border-green-400' : '',
      },
    ];
  }, [performanceData]);

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    fetchData();
    fetchHistory();
    fetchPerformance();
    fetchAdvanced();
  }, [fetchData, fetchHistory, fetchPerformance, fetchAdvanced]);

  // Handle test Telegram notification
  const handleTestTelegram = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/test-telegram`);
      const result = await response.json();
      
      if (result.success) {
        alert('Test notification sent to Telegram successfully!');
      } else {
        alert(`Failed to send test notification: ${result.message}`);
      }
    } catch (error) {
      console.error('Error testing Telegram notification:', error);
      alert('Error sending test notification. Check console for details.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading trading data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Live BTC Price Ticker */}
      <div className="mb-6 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="https://s2.coinmarketcap.com/static/img/coins/64x64/1.png" 
              alt="Bitcoin" 
              className="w-10 h-10 mr-3"
            />
            <div>
              <h2 className="text-xl font-bold text-white">Bitcoin (BTC)</h2>
              <p className="text-blue-200 text-sm">Live price from Binance</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{signalData ? formatPrice(signalData.binancePrice) : '-'}</div>
            <div className={`flex items-center justify-end text-sm ${priceChange.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange.isPositive ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
              {priceChange.value.toFixed(3)}%
            </div>
          </div>
        </div>
        
        {/* Price Chart */}
        <div className="h-32 px-4 pb-4">
          <BitcoinPriceChart data={livePriceData} />
        </div>
      </div>

      <header className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="mr-2 text-primary" size={24} />
            WBTC Scalp Trading Bot
          </h1>
          <div className="flex space-x-3">
            <button
              onClick={handleTestTelegram}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Send size={16} className="mr-2" />
              Test Telegram
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 bg-primary text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center">
          <AlertTriangle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Bot Status Bar */}
      <div className="mb-6 bg-gray-100 rounded-lg p-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center">
          <span className="font-medium mr-2">Trading Mode:</span>
          {signalData?.auto_trading ? (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
              Auto Trading ON
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
              Signal Only Mode
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          <span className="font-medium mr-2">Simulation:</span>
          {signalData?.simulation_mode ? (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              Simulation ON
            </span>
          ) : (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              Live Trading
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          <span className="font-medium mr-2">Position:</span>
          {signalData?.in_position ? (
            <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
              In Position
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
              No Position
            </span>
          )}
        </div>
        
        <div className="flex items-center">
          <span className="font-medium mr-2">Balance:</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            {formatPrice(performanceData?.metrics?.current_balance || 0)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SignalCard
          signal={signalData?.signal || 'WAIT'}
          timestamp={signalData?.timestamp}
          autoTrading={signalData?.auto_trading}
          signalStrength={advancedData?.signal_strength}
        />
        
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric, i) => (
            <MetricCard
              key={i}
              title={metric.title}
              value={metric.value}
              className={metric.className}
            />
          ))}
        </div>
      </div>
      
      {/* Advanced Trading Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart2 className="mr-2 text-indigo-600" size={20} />
          Advanced Trading Metrics
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {advancedMetrics.map((metric, i) => (
            <MetricCard
              key={i}
              title={metric.title}
              value={metric.value}
              className={metric.className}
            />
          ))}
        </div>
      </div>
      
      {/* Multi-Timeframe Analysis */}
      {advancedData?.timeframe_data && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Layers className="mr-2 text-blue-600" size={20} />
            Multi-Timeframe Analysis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(advancedData.timeframe_data).map(([timeframe, data]) => (
              <div key={timeframe} className="bg-white border rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-2">{timeframe.toUpperCase()} Timeframe</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-sm">
                    <span className="font-medium">RSI:</span> {formatRSI(data.rsi)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">EMA:</span> {formatPrice(data.ema)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Performance Metrics */}
      {performanceData?.metrics && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <PerformanceIcon className="mr-2 text-green-600" size={20} />
            Performance Metrics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, i) => (
              <MetricCard
                key={i}
                title={metric.title}
                value={metric.value}
                className={metric.className}
              />
            ))}
          </div>
        </div>
      )}

      <SignalHistoryCard signals={signalHistory} />
      
      <footer className="mt-8 text-center text-sm text-gray-500">
        <p>Data refreshes automatically every 30 seconds</p>
        <p className="mt-1">Last updated: {signalData?.timestamp ? new Date(signalData.timestamp).toLocaleString() : 'N/A'}</p>
      </footer>
    </div>
  );
};

export default Dashboard; 