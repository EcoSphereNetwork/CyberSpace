export interface Theme {
  colors: {
    background: {
      default: string;
      paper: string;
    };
    surface: {
      default: string;
      hover: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    primary: {
      main: string;
      light: string;
      dark: string;
    };
  };
  typography: {
    fontSizes: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
  };
}

export const theme: Theme = {
  colors: {
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    surface: {
      default: '#2e2e2e',
      hover: '#3e3e3e',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
    },
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
  },
  typography: {
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
};