import React, { useEffect, useState } from 'react';

const ApiUrlDebug: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [healthData, setHealthData] = useState<any>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Not set';

  useEffect(() => {
    const testApiConnection = async () => {
      if (!apiUrl || apiUrl === 'Not set') {
        setApiStatus('error');
        setErrorMessage('API URL not configured');
        return;
      }

      try {
        // Test the health endpoint
        const response = await fetch(`${apiUrl}/health`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setHealthData(data);
        setApiStatus('success');
      } catch (error) {
        setApiStatus('error');
        setErrorMessage(error instanceof Error ? error.message : String(error));
        console.error('API connection test failed:', error);
      }
    };

    testApiConnection();
  }, [apiUrl]);

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
      fontSize: '12px',
      width: '300px',
      maxHeight: '200px',
      overflow: 'auto'
    }}>
      <p><strong>API URL:</strong> {apiUrl}</p>
      <p>
        <strong>Status:</strong> 
        {apiStatus === 'loading' && '🔄 Testing connection...'}
        {apiStatus === 'success' && '✅ Connected'}
        {apiStatus === 'error' && '❌ Connection failed'}
      </p>
      {apiStatus === 'error' && (
        <p><strong>Error:</strong> {errorMessage}</p>
      )}
      {apiStatus === 'success' && healthData && (
        <div>
          <p><strong>Health Data:</strong></p>
          <pre style={{ fontSize: '10px', overflow: 'auto' }}>
            {JSON.stringify(healthData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default ApiUrlDebug;
