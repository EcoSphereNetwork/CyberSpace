import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@emotion/react";
import { theme } from "@/styles/theme";
import { ErrorBoundary } from "../ErrorBoundary";

const ThrowError = () => {
  throw new Error("Test error");
};

const TestComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error("Test error");
  }
  return <div>Test content</div>;
};

describe("ErrorBoundary", () => {
  const consoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = consoleError;
  });

  it("renders children when no error occurs", () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <div>Test content</div>
        </ErrorBoundary>
      </ThemeProvider>
    );

    expect(screen.getByText("Test content")).toBeInTheDocument();
  });

  it("renders error UI when error occurs", () => {
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      </ThemeProvider>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByText("Test error")).toBeInTheDocument();
  });

  it("calls onError prop when error occurs", () => {
    const onError = jest.fn();
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      </ThemeProvider>
    );

    expect(onError).toHaveBeenCalled();
  });

  it("renders custom fallback when provided", () => {
    const fallback = <div>Custom error message</div>;
    render(
      <ThemeProvider theme={theme}>
        <ErrorBoundary fallback={fallback}>
          <ThrowError />
        </ErrorBoundary>
      </ThemeProvider>
    );

    expect(screen.getByText("Custom error message")).toBeInTheDocument();
  });

  it("resets error state when retry button is clicked", () => {
    const TestWrapper = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true);
      return (
        <ThemeProvider theme={theme}>
          <ErrorBoundary>
            <TestComponent shouldThrow={shouldThrow} />
            <button onClick={() => setShouldThrow(false)}>Reset</button>
          </ErrorBoundary>
        </ThemeProvider>
      );
    };

    render(<TestWrapper />);
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Try Again"));
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });
});
