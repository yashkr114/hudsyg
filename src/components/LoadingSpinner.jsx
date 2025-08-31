import React from "react";

function LoadingSpinner({ size = 24, className = "" }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        style={{ width: size, height: size }}
      ></div>
    </div>
  );
}

export default LoadingSpinner;
