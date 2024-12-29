import { useContext } from 'react';
import { AppContext } from '@/contexts/AppContext';
import { App } from '@/core/App';

/**
 * Hook to access the App instance from any component
 */
export function useApp(): App {
  const app = useContext(AppContext);
  if (!app) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return app;
}