import { renderHook, act } from "@testing-library/react";
import { useViewport } from "../useViewport";

describe("useViewport", () => {
  it("initializes with default values", () => {
    const { result } = renderHook(() => useViewport());

    expect(result.current.viewport).toEqual({
      x: 0,
      y: 0,
      zoom: 1,
    });
  });

  it("initializes with provided values", () => {
    const { result } = renderHook(() =>
      useViewport({
        x: 100,
        y: 200,
        zoom: 0.5,
      })
    );

    expect(result.current.viewport).toEqual({
      x: 100,
      y: 200,
      zoom: 0.5,
    });
  });

  it("updates viewport", () => {
    const { result } = renderHook(() => useViewport());

    act(() => {
      result.current.setViewport({
        x: 50,
        y: 75,
        zoom: 1.5,
      });
    });

    expect(result.current.viewport).toEqual({
      x: 50,
      y: 75,
      zoom: 1.5,
    });
  });

  it("partially updates viewport", () => {
    const { result } = renderHook(() => useViewport());

    act(() => {
      result.current.setViewport({
        zoom: 2,
      });
    });

    expect(result.current.viewport).toEqual({
      x: 0,
      y: 0,
      zoom: 2,
    });
  });
});
