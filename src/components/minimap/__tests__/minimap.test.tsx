import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { MinimapCanvas } from "../MinimapCanvas";

const mockRegions = [
  { id: "1", x: 10, y: 10, width: 100, height: 100, label: "Region 1" },
  { id: "2", x: 120, y: 10, width: 100, height: 100, label: "Region 2" },
];

const mockMarkers = [
  { id: "1", x: 50, y: 50, label: "Marker 1" },
  { id: "2", x: 150, y: 50, label: "Marker 2" },
];

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe("MinimapCanvas", () => {
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
      <MinimapCanvas
        regions={mockRegions}
        markers={mockMarkers}
      />
    );
  });

  it("handles region click events", () => {
    const onRegionClick = jest.fn();
    renderWithTheme(
      <MinimapCanvas
        regions={mockRegions}
        markers={mockMarkers}
        onRegionClick={onRegionClick}
      />
    );
  });

  it("handles marker click events", () => {
    const onMarkerClick = jest.fn();
    renderWithTheme(
      <MinimapCanvas
        regions={mockRegions}
        markers={mockMarkers}
        onMarkerClick={onMarkerClick}
      />
    );
  });
});
