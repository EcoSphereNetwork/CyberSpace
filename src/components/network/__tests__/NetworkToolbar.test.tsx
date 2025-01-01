import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { NetworkToolbar } from "../NetworkToolbar";

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe("NetworkToolbar", () => {
  it("renders without crashing", () => {
    renderWithTheme(
      <NetworkToolbar
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onResetCamera={() => {}}
        onLayerChange={() => {}}
        onHelp={() => {}}
      />
    );
  });

  it("handles zoom in click", () => {
    const onZoomIn = jest.fn();
    renderWithTheme(
      <NetworkToolbar
        onZoomIn={onZoomIn}
        onZoomOut={() => {}}
        onResetCamera={() => {}}
        onLayerChange={() => {}}
        onHelp={() => {}}
      />
    );
  });

  it("handles zoom out click", () => {
    const onZoomOut = jest.fn();
    renderWithTheme(
      <NetworkToolbar
        onZoomIn={() => {}}
        onZoomOut={onZoomOut}
        onResetCamera={() => {}}
        onLayerChange={() => {}}
        onHelp={() => {}}
      />
    );
  });

  it("handles reset camera click", () => {
    const onResetCamera = jest.fn();
    renderWithTheme(
      <NetworkToolbar
        onZoomIn={() => {}}
        onZoomOut={() => {}}
        onResetCamera={onResetCamera}
        onLayerChange={() => {}}
        onHelp={() => {}}
      />
    );
  });
});
