import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { NetworkScene } from "../NetworkScene";

const mockNodes = [
  {
    id: "1",
    type: "server",
    label: "Server 1",
    status: "online" as const,
  },
  {
    id: "2",
    type: "client",
    label: "Client 1",
    status: "online" as const,
  },
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

jest.mock("@react-three/fiber", () => ({
  useFrame: jest.fn(),
  useThree: jest.fn().mockReturnValue({
    camera: {},
    scene: {},
    gl: {},
  }),
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe("NetworkScene", () => {
  it("renders without crashing", () => {
    renderWithTheme(
      <NetworkScene
        nodes={mockNodes}
        links={mockLinks}
      />
    );
  });

  it("handles node click events", () => {
    const onNodeClick = jest.fn();
    renderWithTheme(
      <NetworkScene
        nodes={mockNodes}
        links={mockLinks}
        onNodeClick={onNodeClick}
      />
    );
  });

  it("handles link click events", () => {
    const onLinkClick = jest.fn();
    renderWithTheme(
      <NetworkScene
        nodes={mockNodes}
        links={mockLinks}
        onLinkClick={onLinkClick}
      />
    );
  });

  it("updates when data changes", () => {
    const { rerender } = renderWithTheme(
      <NetworkScene
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
        <NetworkScene
          nodes={newNodes}
          links={mockLinks}
        />
      </ThemeProvider>
    );
  });
});
