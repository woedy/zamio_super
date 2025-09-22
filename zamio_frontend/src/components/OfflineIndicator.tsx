import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface OfflineIndicatorProps {
  className?: string;
  showWhenOnline?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  className = '',
  showWhenOnline = false
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3000);
        setWasOffline(false);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(true);
      setShowReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [wasOffline]);

  // Don't show anything if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !showReconnected) {
    return null;
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${className}`}>
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-pulse">
          <WifiOff className="w-5 h-5" />
          <span className="text-sm font-medium">You're offline</span>
          <AlertCircle className="w-4 h-4" />
        </div>
      )}

      {showReconnected && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-bounce">
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-medium">Back online!</span>
          <CheckCircle className="w-4 h-4" />
        </div>
      )}

      {isOnline && showWhenOnline && !showReconnected && (
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <Wifi className="w-5 h-5" />
          <span className="text-sm font-medium">Online</span>
        </div>
      )}
    </div>
  );
};

// Hook for monitoring online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Test connection quality periodically
    const testConnection = async () => {
      if (!navigator.onLine) {
        setConnectionQuality('offline');
        return;
      }

      try {
        const start = Date.now();
        const response = await fetch('/api/health/', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        const duration = Date.now() - start;

        if (response.ok) {
          setConnectionQuality(duration > 2000 ? 'poor' : 'good');
        } else {
          setConnectionQuality('poor');
        }
      } catch {
        setConnectionQuality('poor');
      }
    };

    // Test connection every 30 seconds
    const interval = setInterval(testConnection, 30000);
    testConnection(); // Initial test

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, connectionQuality };
};

// Component for showing connection quality
interface ConnectionQualityProps {
  className?: string;
}

export const ConnectionQuality: React.FC<ConnectionQualityProps> = ({ className = '' }) => {
  const { isOnline, connectionQuality } = useOnlineStatus();

  const getIndicatorColor = () => {
    switch (connectionQuality) {
      case 'good':
        return 'text-green-500';
      case 'poor':
        return 'text-yellow-500';
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getTooltipText = () => {
    switch (connectionQuality) {
      case 'good':
        return 'Good connection';
      case 'poor':
        return 'Slow connection';
      case 'offline':
        return 'No connection';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`} title={getTooltipText()}>
      {isOnline ? (
        <Wifi className={`w-4 h-4 ${getIndicatorColor()}`} />
      ) : (
        <WifiOff className="w-4 h-4 text-red-500" />
      )}
      <div className="flex space-x-1">
        <div className={`w-1 h-3 rounded-full ${connectionQuality !== 'offline' ? 'bg-current' : 'bg-gray-300'} ${getIndicatorColor()}`} />
        <div className={`w-1 h-3 rounded-full ${connectionQuality === 'good' ? 'bg-current' : 'bg-gray-300'} ${getIndicatorColor()}`} />
        <div className={`w-1 h-3 rounded-full ${connectionQuality === 'good' ? 'bg-current' : 'bg-gray-300'} ${getIndicatorColor()}`} />
      </div>
    </div>
  );
};

// Hook for handling offline functionality
export const useOfflineCapability = () => {
  const { isOnline } = useOnlineStatus();
  const [pendingActions, setPendingActions] = useState<Array<{
    id: string;
    action: () => Promise<any>;
    description: string;
  }>>([]);

  const addPendingAction = (action: () => Promise<any>, description: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setPendingActions(prev => [...prev, { id, action, description }]);
    return id;
  };

  const removePendingAction = (id: string) => {
    setPendingActions(prev => prev.filter(action => action.id !== id));
  };

  const executePendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return;

    const results = [];
    for (const pendingAction of pendingActions) {
      try {
        const result = await pendingAction.action();
        results.push({ id: pendingAction.id, success: true, result });
        removePendingAction(pendingAction.id);
      } catch (error) {
        results.push({ id: pendingAction.id, success: false, error });
      }
    }

    return results;
  };

  // Auto-execute pending actions when coming back online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      executePendingActions();
    }
  }, [isOnline, pendingActions.length]);

  return {
    isOnline,
    pendingActions,
    addPendingAction,
    removePendingAction,
    executePendingActions
  };
};