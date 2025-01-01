import { Theme } from '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      background: {
        default: string;
        paper: string;
      };
      surface: {
        default: string;
        hover: string;
        active: string;
      };
      primary: {
        main: string;
        dark: string;
        light: string;
      };
      secondary: {
        main: string;
        dark: string;
        light: string;
      };
      text: {
        primary: string;
        secondary: string;
      };
      status: {
        error: string;
        warning: string;
        success: string;
        info: string;
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
}

export const theme: Theme = {
  colors: {
    background: {
      default: '#1a1a1a',
      paper: '#2a2a2a',
    },
    surface: {
      default: '#333333',
      hover: '#444444',
      active: '#555555',
    },
    primary: {
      main: '#00cc66',
      dark: '#009944',
      light: '#33ff99',
    },
    secondary: {
      main: '#00ccff',
      dark: '#0099cc',
      light: '#33ffff',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    status: {
      error: '#ff0000',
      warning: '#ffaa00',
      success: '#00cc66',
      info: '#00ccff',
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
