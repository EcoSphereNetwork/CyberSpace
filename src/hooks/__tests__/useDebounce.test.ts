import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("debounces callback", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 500));

    // Call debounced function multiple times
    act(() => {
      result.current("test1");
      result.current("test2");
      result.current("test3");
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Callback should be called once with last value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("test3");
  });

  it("cancels previous timeout", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebounce(callback, 500));

    // Call debounced function
    act(() => {
      result.current("test1");
    });

    // Wait some time but not enough to trigger callback
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Call again with different value
    act(() => {
      result.current("test2");
    });

    // Wait for original timeout
    act(() => {
      jest.advanceTimersByTime(200);
    });

    // Callback should not be called yet
    expect(callback).not.toHaveBeenCalled();

    // Wait for second timeout
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Callback should be called once with second value
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("test2");
  });
});
