import React from 'react';

/**
 * Loading spinner component
 */
const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClass = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }[size] || 'w-8 h-8';

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClass} border-4 border-gray-200 border-t-primary rounded-full animate-spin`}></div>
    </div>
  );
};

export default LoadingSpinner; 