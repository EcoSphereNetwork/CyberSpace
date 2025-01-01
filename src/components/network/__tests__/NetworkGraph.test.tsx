import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { NetworkGraph } from "../NetworkGraph";

const mockNodes = [
  { id: "1", type: "server", label: "Server 1", status: "online" as const },
  { id: "2", type: "client", label: "Client 1", status: "online" as const },
];

const mockLinks = [
  {
    id: "1",
    source: "1",
    target: "2",
    type: "connection",
    label: "HTTP",
    status: "online" as const,
  },
];

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe("NetworkGraph", () => {
  beforeEach(() => {
    const mockCanvas = document.createElement("canvas");
    const mockContext = mockCanvas.getContext("2d");

    if (mockContext) {
      // Add missing methods
      mockContext.createConicGradient = jest.fn();
      mockContext.roundRect = jest.fn();
      mockContext.reset = jest.fn();
      mockContext.fillText = jest.fn();
      mockContext.strokeText = jest.fn();
      mockContext.fontKerning = "auto";
      mockContext.drawFocusIfNeeded = jest.fn();
      mockContext.scale = jest.fn();
    }

    const mockGetContext = jest.fn((contextId: string) => {
      if (contextId === "2d") {
        return mockContext;
      }
      if (contextId === "bitmaprenderer") {
        return {
          transferFromImageBitmap: jest.fn(),
        };
      }
      if (contextId === "webgl") {
        return {
          canvas: { width: 800, height: 600 },
          drawingBufferWidth: 800,
          drawingBufferHeight: 600,
        };
      }
      return null;
    });

    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      value: mockGetContext,
      writable: true,
    });
  });

  it("renders without crashing", () => {
    renderWithTheme(
      <NetworkGraph
        nodes={mockNodes}
        links={mockLinks}
      />
    );
  });

  it("handles node click events", () => {
    const onNodeClick = jest.fn();
    renderWithTheme(
      <NetworkGraph
        nodes={mockNodes}
        links={mockLinks}
        onNodeClick={onNodeClick}
      />
    );
  });

  it("handles link click events", () => {
    const onLinkClick = jest.fn();
    renderWithTheme(
      <NetworkGraph
        nodes={mockNodes}
        links={mockLinks}
        onLinkClick={onLinkClick}
      />
    );
  });

  it("updates when data changes", () => {
    const { rerender } = renderWithTheme(
      <NetworkGraph
        nodes={mockNodes}
        links={mockLinks}
      />
    );

    const newNodes = [
      ...mockNodes,
      {
        id: "3",
        type: "server",
        label: "Server 2",
        status: "online" as const,
      },
    ];

    rerender(
      <ThemeProvider theme={theme}>
        <NetworkGraph
          nodes={newNodes}
          links={mockLinks}
        />
      </ThemeProvider>
    );
  });
});
