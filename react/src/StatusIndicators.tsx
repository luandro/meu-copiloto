import React from 'react';

interface StatusIndicatorsProps {
  isLoaded: boolean;
  error: string | null;
  accessKeyError: string | null;
}

const StatusIndicators: React.FC<StatusIndicatorsProps> = ({ isLoaded, error, accessKeyError }) => {
  return (
    <div className="flex items-center mb-4">
      {isLoaded && <div className="loaded-indicator">Engine Loaded</div>}
      {error && <div className="error-indicator">{error}</div>}
      {accessKeyError && <div className="access-key-error-indicator">{accessKeyError}</div>}
    </div>
  );
};

export default StatusIndicators;