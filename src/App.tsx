import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { theme } from '@/styles/theme';
import App from '@/components/App';

const Root: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  );
};

export default Root;
