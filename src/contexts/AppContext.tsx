import React, { createContext, useEffect, useState } from 'react';
import { App, AppConfig } from '@/core/App';

export const AppContext = createContext<App | null>(null);

interface AppProviderProps {
  config?: AppConfig;
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({
  config,
  children,
}) => {
  const [app] = useState(() => App.getInstance(config));
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await app.initialize();
        setInitialized(true);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('Failed to initialize app')
        );
      }
    };

    if (!app.isInitialized()) {
      initializeApp();
    } else {
      setInitialized(true);
    }

    return () => {
      app.shutdown().catch(console.error);
    };
  }, [app]);

  if (error) {
    return (
      <div
        style={{
          padding: '20px',
          color: '#ff0000',
          background: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
        }}
      >
        <h2>Error Initializing App</h2>
        <pre>{error.message}</pre>
      </div>
    );
  }

  if (!initialized) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Loading...
      </div>
    );
  }

  return <AppContext.Provider value={app}>{children}</AppContext.Provider>;
};
