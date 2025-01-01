import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";

const ErrorComponent = () => {
  throw new Error("Test error");
};

const MockComponent = () => <div>Mock Component</div>;

describe("ErrorBoundary", () => {
  beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders children when no error", () => {
    render(
      <ErrorBoundary>
        <MockComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Mock Component")).toBeInTheDocument();
  });

  it("renders error message when error occurs", () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });

  it("renders retry button when error occurs", () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Try Again")).toBeInTheDocument();
  });

  it("calls onError when error occurs", () => {
    const onError = jest.fn();
    render(
      <ErrorBoundary onError={onError}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
  });

  it("resets error state when retry button is clicked", () => {
    const onRetry = jest.fn();
    render(
      <ErrorBoundary onRetry={onRetry}>
        <ErrorComponent />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText("Try Again"));
    expect(onRetry).toHaveBeenCalled();
  });
});
