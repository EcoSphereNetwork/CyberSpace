import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EarthScene } from "../EarthScene";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";

jest.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useThree: () => ({
    camera: {
      position: { x: 0, y: 0, z: 0 },
      lookAt: jest.fn(),
    },
    scene: {
      add: jest.fn(),
      remove: jest.fn(),
    },
  }),
}));

describe("EarthScene", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider theme={theme}>
        <EarthScene />
      </ThemeProvider>
    );
  });

  it("displays earth model", () => {
    render(
      <ThemeProvider theme={theme}>
        <EarthScene />
      </ThemeProvider>
    );
    // Add assertions for earth model
  });

  it("handles location markers", () => {
    render(
      <ThemeProvider theme={theme}>
        <EarthScene />
      </ThemeProvider>
    );
    // Add assertions for location markers
  });

  it("updates camera position on location focus", () => {
    render(
      <ThemeProvider theme={theme}>
        <EarthScene />
      </ThemeProvider>
    );
    // Add assertions for camera movement
  });
});
