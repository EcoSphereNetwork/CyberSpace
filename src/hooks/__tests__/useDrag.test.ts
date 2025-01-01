import { renderHook, act } from "@testing-library/react";
import { useDrag } from "../useDrag";

describe("useDrag", () => {
  beforeEach(() => {
    // Mock event listeners
    document.addEventListener = jest.fn();
    document.removeEventListener = jest.fn();
  });

  it("initializes with default config", () => {
    const ref = { current: document.createElement("div") };
    const { result } = renderHook(() => useDrag(ref));

    expect(result.current.isDragging).toBe(false);
  });

  it("handles drag start", () => {
    const onDragStart = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() =>
      useDrag(ref, {
        onDragStart,
      })
    );

    // Simulate mousedown
    act(() => {
      const mousedown = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
      });
      ref.current?.dispatchEvent(mousedown);
    });

    expect(onDragStart).toHaveBeenCalledWith(100, 100);
  });

  it("handles drag", () => {
    const onDrag = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() =>
      useDrag(ref, {
        onDrag,
      })
    );

    // Simulate drag
    act(() => {
      const mousedown = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
      });
      ref.current?.dispatchEvent(mousedown);

      const mousemove = new MouseEvent("mousemove", {
        clientX: 150,
        clientY: 150,
      });
      document.dispatchEvent(mousemove);
    });

    expect(onDrag).toHaveBeenCalledWith(50, 50);
  });

  it("handles drag end", () => {
    const onDragEnd = jest.fn();
    const ref = { current: document.createElement("div") };

    renderHook(() =>
      useDrag(ref, {
        onDragEnd,
      })
    );

    // Simulate drag end
    act(() => {
      const mousedown = new MouseEvent("mousedown", {
        clientX: 100,
        clientY: 100,
      });
      ref.current?.dispatchEvent(mousedown);

      const mouseup = new MouseEvent("mouseup", {
        clientX: 200,
        clientY: 200,
      });
      document.dispatchEvent(mouseup);
    });

    expect(onDragEnd).toHaveBeenCalledWith(200, 200);
  });
});
