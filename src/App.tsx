import React from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { theme } from '@/styles/theme';
import { AppProvider } from '@/contexts/AppContext';
import { SceneManager } from '@/scenes/SceneManager';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <AppProvider>
        <SceneManager />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;