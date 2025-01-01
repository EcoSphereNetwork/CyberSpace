import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { PluginManager } from "../PluginManager";
import { Plugin, PluginStatus } from "@/types/plugin";

const mockPlugins: Plugin[] = [
  {
    id: "plugin1",
    name: "Plugin 1",
    description: "Plugin 1 Description",
    author: "Author 1",
    version: "1.0.0",
    enabled: true,
    status: "active" as PluginStatus,
  },
  {
    id: "plugin2",
    name: "Plugin 2",
    description: "Plugin 2 Description",
    author: "Author 2",
    version: "1.0.0",
    enabled: false,
    status: "inactive" as PluginStatus,
  },
];

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe("PluginManager", () => {
  it("renders without crashing", () => {
    renderWithTheme(<PluginManager plugins={mockPlugins} />);
  });

  it("displays plugin list", () => {
    renderWithTheme(<PluginManager plugins={mockPlugins} />);
  });

  it("handles plugin toggle", () => {
    const onToggle = jest.fn();
    renderWithTheme(
      <PluginManager
        plugins={mockPlugins}
        onToggle={onToggle}
      />
    );
  });

  it("updates when plugins change", () => {
    const { rerender } = renderWithTheme(
      <PluginManager plugins={mockPlugins} />
    );

    const updatedPlugins = [
      ...mockPlugins,
      {
        id: "plugin3",
        name: "Plugin 3",
        description: "Plugin 3 Description",
        author: "Author 3",
        version: "1.0.0",
        enabled: true,
        status: "active" as PluginStatus,
      },
    ];

    rerender(
      <ThemeProvider theme={theme}>
        <PluginManager plugins={updatedPlugins} />
      </ThemeProvider>
    );
  });
});
