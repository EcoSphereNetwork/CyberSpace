import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { WindowManager } from "../WindowManager";

const mockWindows = [
  {
    id: "window1",
    title: "Window 1",
    component: () => <div>Window 1 Content</div>,
    children: <div>Window 1 Content</div>,
  },
  {
    id: "window2",
    title: "Window 2",
    component: () => <div>Window 2 Content</div>,
    children: <div>Window 2 Content</div>,
  },
];

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe("WindowManager", () => {
  it("renders without crashing", () => {
    renderWithTheme(
      <WindowManager windows={mockWindows} />
    );
  });

  it("handles window focus", () => {
    const onFocus = jest.fn();
    renderWithTheme(
      <WindowManager
        windows={mockWindows}
        onFocus={onFocus}
      />
    );
  });

  it("handles window close", () => {
    const onClose = jest.fn();
    renderWithTheme(
      <WindowManager
        windows={mockWindows}
        onClose={onClose}
      />
    );
  });
});
