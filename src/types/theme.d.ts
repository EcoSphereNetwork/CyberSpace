import "@emotion/react";

declare module "@emotion/react" {
  export interface Theme {
    colors: {
      primary: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
      };
      secondary: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
      };
      error: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
      };
      warning: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
      };
      info: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
      };
      success: {
        main: string;
        dark: string;
        light: string;
        contrastText: string;
      };
      text: {
        primary: string;
        secondary: string;
        disabled: string;
      };
      background: {
        default: string;
        paper: string;
        disabled: string;
      };
      divider: string;
      action: {
        active: string;
        hover: string;
        selected: string;
        disabled: string;
      };
      common: {
        black: string;
        white: string;
      };
      grey: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
    shadows: string[];
  }
}
