import { useState, useEffect } from 'react';

export interface NetworkStatus {
  isConnected: boolean;
  lastConnected: Date | null;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    lastConnected: new Date(),
  });

  useEffect(() => {
    // Simple network checking using fetch
    const checkConnection = async () => {
      try {
        // Try to fetch a small resource to check connectivity
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache',
        });
        
        setNetworkStatus(prev => ({
          isConnected: true,
          lastConnected: new Date(),
        }));
      } catch (error) {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: false,
        }));
      }
    };

    // Check immediately
    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return networkStatus;
};

export default useNetworkStatus;