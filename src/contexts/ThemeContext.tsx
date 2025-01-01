import React, { createContext, useContext } from 'react';
import { Theme } from '@/styles/theme';

const ThemeContext = createContext<Theme | undefined>(undefined);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
};

export const ThemeProvider: React.FC<{ theme: Theme; children: React.ReactNode }> = ({
  theme,
  children,
}) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};