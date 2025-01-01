import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Input } from "../Input";
import { Tooltip } from "../Tooltip";
import { Badge } from "../Badge";
import { Icon } from "../Icon";

describe("UI Components", () => {
  describe("Button", () => {
    it("renders button with text", () => {
      render(
        <ThemeProvider theme={theme}>
          <Button>Click me</Button>
        </ThemeProvider>
      );

      expect(screen.getByText("Click me")).toBeInTheDocument();
    });

    it("handles click events", () => {
      const onClick = jest.fn();

      render(
        <ThemeProvider theme={theme}>
          <Button onClick={onClick}>Click me</Button>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByText("Click me"));
      expect(onClick).toHaveBeenCalled();
    });

    it("supports different variants", () => {
      render(
        <ThemeProvider theme={theme}>
          <Button variant="contained">Contained</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </ThemeProvider>
      );

      expect(screen.getByText("Contained")).toBeInTheDocument();
      expect(screen.getByText("Outlined")).toBeInTheDocument();
      expect(screen.getByText("Text")).toBeInTheDocument();
    });
  });

  describe("IconButton", () => {
    it("renders icon button", () => {
      render(
        <ThemeProvider theme={theme}>
          <IconButton>
            <Icon name="close" />
          </IconButton>
        </ThemeProvider>
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("handles click events", () => {
      const onClick = jest.fn();

      render(
        <ThemeProvider theme={theme}>
          <IconButton onClick={onClick}>
            <Icon name="close" />
          </IconButton>
        </ThemeProvider>
      );

      fireEvent.click(screen.getByRole("button"));
      expect(onClick).toHaveBeenCalled();
    });
  });

  describe("Input", () => {
    it("renders input field", () => {
      render(
        <ThemeProvider theme={theme}>
          <Input placeholder="Enter text" />
        </ThemeProvider>
      );

      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("handles value changes", () => {
      const onChange = jest.fn();

      render(
        <ThemeProvider theme={theme}>
          <Input
            placeholder="Enter text"
            onChange={onChange}
          />
        </ThemeProvider>
      );

      fireEvent.change(screen.getByPlaceholderText("Enter text"), {
        target: { value: "Hello" },
      });
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Tooltip", () => {
    it("shows tooltip on hover", async () => {
      render(
        <ThemeProvider theme={theme}>
          <Tooltip content="Tooltip text">
            <button>Hover me</button>
          </Tooltip>
        </ThemeProvider>
      );

      fireEvent.mouseEnter(screen.getByText("Hover me"));
      expect(await screen.findByText("Tooltip text")).toBeInTheDocument();
    });
  });

  describe("Badge", () => {
    it("renders badge with content", () => {
      render(
        <ThemeProvider theme={theme}>
          <Badge badgeContent={5}>
            <div>Content</div>
          </Badge>
        </ThemeProvider>
      );

      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });
  });

  describe("Icon", () => {
    it("renders icon", () => {
      render(
        <ThemeProvider theme={theme}>
          <Icon name="close" />
        </ThemeProvider>
      );

      expect(screen.getByText("close")).toBeInTheDocument();
    });

    it("supports different sizes", () => {
      render(
        <ThemeProvider theme={theme}>
          <Icon name="close" size="small" />
          <Icon name="close" size="medium" />
          <Icon name="close" size="large" />
        </ThemeProvider>
      );

      const icons = screen.getAllByText("close");
      expect(icons).toHaveLength(3);
    });
  });
});
