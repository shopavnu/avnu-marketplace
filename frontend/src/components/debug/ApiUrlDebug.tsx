import React from 'react';

const ApiUrlDebug: React.FC = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      padding: '10px', 
      background: '#f0f0f0', 
      border: '1px solid #ccc',
      borderRadius: '4px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'Not set'}</p>
    </div>
  );
};

export default ApiUrlDebug;
