import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { PluginManager } from "../PluginManager";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";

describe("PluginManager", () => {
  const mockPlugins = [
    { id: "1", name: "Test Plugin 1", enabled: true },
    { id: "2", name: "Test Plugin 2", enabled: false },
  ];

  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={theme}>
        <PluginManager plugins={mockPlugins} />
      </ThemeProvider>
    );
  });

  it("displays plugin list", () => {
    render(
      <ThemeProvider theme={theme}>
        <PluginManager plugins={mockPlugins} />
      </ThemeProvider>
    );
    expect(screen.getByText("Test Plugin 1")).toBeInTheDocument();
    expect(screen.getByText("Test Plugin 2")).toBeInTheDocument();
  });

  it("handles plugin toggle", () => {
    const onToggle = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <PluginManager plugins={mockPlugins} onToggle={onToggle} />
      </ThemeProvider>
    );
    // Add assertions for plugin toggle
  });

  it("displays plugin details", () => {
    render(
      <ThemeProvider theme={theme}>
        <PluginManager plugins={mockPlugins} />
      </ThemeProvider>
    );
    // Add assertions for plugin details
  });
});
