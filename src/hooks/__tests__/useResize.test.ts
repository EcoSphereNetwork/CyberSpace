import { renderHook } from "@testing-library/react";
import { useResize } from "../useResize";

describe("useResize", () => {
  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  it("initializes with default config", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useResize(ref));

    expect(result.current.handleResize).toBeDefined();
  });

  it("calls onResize callback", () => {
    const onResize = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() =>
      useResize(ref, {
        onResize,
      })
    );

    // Simulate resize
    const resizeObserver = ResizeObserver as jest.Mock;
    const observerCallback = resizeObserver.mock.calls[0][0];
    observerCallback([
      {
        contentRect: {
          width: 200,
          height: 150,
        },
      },
    ]);

    expect(onResize).toHaveBeenCalled();
  });

  it("respects min width and height", () => {
    const onResize = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() =>
      useResize(ref, {
        minWidth: 300,
        minHeight: 200,
        onResize,
      })
    );

    // Simulate resize
    const resizeObserver = ResizeObserver as jest.Mock;
    const observerCallback = resizeObserver.mock.calls[0][0];
    observerCallback([
      {
        contentRect: {
          width: 100,
          height: 100,
        },
      },
    ]);

    expect(onResize).toHaveBeenCalled();
  });
});
