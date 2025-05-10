import React from 'react';

const ConnectionStatus = ({ isConnected }) => {
  return (
    <div className="flex items-center">
      <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-sm text-gray-600">
        {isConnected ? 'Real-time connection active' : 'Disconnected - using polling'}
      </span>
    </div>
  );
};

export default ConnectionStatus; 