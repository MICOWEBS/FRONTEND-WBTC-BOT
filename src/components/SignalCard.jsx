import React from 'react';
import { getSignalInfo, formatDate } from '../utils/formatters';

/**
 * Display the current trading signal
 */
const SignalCard = ({ signal, timestamp, autoTrading = false, signalStrength = null }) => {
  const signalInfo = getSignalInfo(signal);
  
  // Get background style based on signal
  const getBackground = () => {
    switch (signalInfo.text) {
      case 'BUY':
        return 'bg-gradient-to-br from-green-500 to-green-700';
      case 'SELL':
        return 'bg-gradient-to-br from-red-500 to-red-700';
      case 'HOLD':
        return 'bg-gradient-to-br from-yellow-500 to-amber-700';
      default:
        return 'bg-gradient-to-br from-gray-500 to-gray-700';
    }
  };
  
  // Get pulsing animation class
  const getPulseAnimation = () => {
    if (signalInfo.text === 'BUY' || signalInfo.text === 'SELL') {
      return 'animate-pulse';
    }
    return '';
  };
  
  // Format signal strength display
  const getSignalStrengthLabel = (strength) => {
    if (strength === null || strength === undefined) return null;
    
    let label = 'Weak';
    let color = 'bg-yellow-300 text-yellow-800';
    
    if (strength >= 70) {
      label = 'Strong';
      color = 'bg-green-300 text-green-800';
    } else if (strength >= 40) {
      label = 'Moderate';
      color = 'bg-blue-300 text-blue-800';
    }
    
    return { label, color };
  };
  
  const strengthInfo = getSignalStrengthLabel(signalStrength);
  
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden ${getBackground()}`}>
      <div className="signal-card text-white">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            {strengthInfo && (
              <span className={`text-xs font-bold py-1 px-2 rounded ${strengthInfo.color}`}>
                {strengthInfo.label}: {signalStrength.toFixed(1)}%
              </span>
            )}
          </div>
          
          {autoTrading !== undefined && (
            <span className={`text-xs py-1 px-2 rounded ${autoTrading ? 'bg-green-300 text-green-800' : 'bg-gray-300 text-gray-800'}`}>
              {autoTrading ? 'Auto Trading' : 'Manual'}
            </span>
          )}
        </div>
        
        <div className={`text-6xl mb-4 ${getPulseAnimation()}`}>
          {signalInfo.indicator}
        </div>
        <div className="text-3xl font-bold mb-1">
          {signalInfo.text}
        </div>
        <div className="text-sm opacity-90">{signalInfo.description}</div>
        {timestamp && (
          <div className="text-xs mt-4 bg-black bg-opacity-20 py-1 px-3 rounded-full">
            {formatDate(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalCard; 