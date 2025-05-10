import React from 'react';

/**
 * Display a metric with title and value
 */
const MetricCard = ({ title, value, icon, className = '' }) => {
  return (
    <div className={`metric-card ${className}`}>
      <div className="flex justify-between items-center">
        <div className="metric-title">{title}</div>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
};

export default MetricCard; 