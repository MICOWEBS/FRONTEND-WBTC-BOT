import React from 'react';
import { getSignalInfo, formatDate, formatPrice, formatPercent } from '../utils/formatters';

/**
 * Display the recent signal history
 */
const SignalHistoryCard = ({ signals = [] }) => {
  if (!signals.length) {
    return (
      <div className="card">
        <h2 className="text-lg font-semibold mb-3">Recent Signals</h2>
        <div className="text-sm text-gray-500 text-center py-6">
          No signals recorded yet
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-3">Recent Signals</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 font-medium text-gray-500">Signal</th>
              <th className="text-right py-2 font-medium text-gray-500">Price (Binance)</th>
              <th className="text-right py-2 font-medium text-gray-500">Price (DEX)</th>
              <th className="text-right py-2 font-medium text-gray-500">Spread</th>
              <th className="text-right py-2 font-medium text-gray-500">Time</th>
            </tr>
          </thead>
          <tbody>
            {signals.slice(0, 5).map((signal, index) => {
              const signalInfo = getSignalInfo(signal.signal);
              return (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${signalInfo.class}`}>
                      {signalInfo.text}
                    </span>
                  </td>
                  <td className="text-right py-3">{formatPrice(signal.binancePrice)}</td>
                  <td className="text-right py-3">{formatPrice(signal.dexPrice)}</td>
                  <td className="text-right py-3">{formatPercent(signal.spread)}</td>
                  <td className="text-right py-3">{formatDate(signal.timestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SignalHistoryCard; 