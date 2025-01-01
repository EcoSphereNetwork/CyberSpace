import { ErrorRecovery, RecoveryStrategy } from "../ErrorRecovery";

describe("ErrorRecovery", () => {
  let errorRecovery: ErrorRecovery;

  beforeEach(() => {
    errorRecovery = ErrorRecovery.getInstance();
    jest.clearAllMocks();
  });

  it("creates a singleton instance", () => {
    const recovery1 = ErrorRecovery.getInstance();
    const recovery2 = ErrorRecovery.getInstance();
    expect(recovery1).toBe(recovery2);
  });

  it("registers and executes recovery strategies", async () => {
    const mockAction = jest.fn().mockResolvedValue(undefined);
    const strategy: RecoveryStrategy = {
      name: "testStrategy",
      condition: (error) => error.message === "test error",
      action: mockAction,
    };

    errorRecovery.registerStrategy(strategy);
    await errorRecovery.recover(new Error("test error"));

    expect(mockAction).toHaveBeenCalled();
  });

  it("removes recovery strategies", () => {
    const mockAction = jest.fn();
    const strategy: RecoveryStrategy = {
      name: "testStrategy",
      condition: () => true,
      action: mockAction,
    };

    errorRecovery.registerStrategy(strategy);
    errorRecovery.removeStrategy("testStrategy");

    expect(errorRecovery.recover(new Error("test"))).rejects.toThrow("No recovery strategy found");
  });

  it("handles network errors with retry strategy", async () => {
    const error = new Error("network error");
    await errorRecovery.recover(error);
    // Verify that the network retry strategy was attempted
    // This would typically involve checking if setTimeout was called
    expect(setTimeout).toHaveBeenCalled();
  });

  it("handles resource loading errors", async () => {
    const mockCaches = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    global.caches = mockCaches as any;

    const error = new Error("resource loading error");
    await errorRecovery.recover(error);

    expect(mockCaches.delete).toHaveBeenCalledWith("resources");
  });

  it("handles state corruption errors", async () => {
    const mockLocalStorage = {
      clear: jest.fn(),
    };
    const mockSessionStorage = {
      clear: jest.fn(),
    };
    Object.defineProperty(window, "localStorage", { value: mockLocalStorage });
    Object.defineProperty(window, "sessionStorage", { value: mockSessionStorage });

    const error = new Error("state corruption error");
    await errorRecovery.recover(error);

    expect(mockLocalStorage.clear).toHaveBeenCalled();
    expect(mockSessionStorage.clear).toHaveBeenCalled();
  });

  it("throws error when no matching strategy is found", async () => {
    const error = new Error("unknown error");
    await expect(errorRecovery.recover(error)).rejects.toThrow("No recovery strategy found");
  });

  it("continues to next strategy if one fails", async () => {
    const failingStrategy: RecoveryStrategy = {
      name: "failingStrategy",
      condition: () => true,
      action: jest.fn().mockRejectedValue(new Error("Strategy failed")),
    };

    const successStrategy: RecoveryStrategy = {
      name: "successStrategy",
      condition: () => true,
      action: jest.fn().mockResolvedValue(undefined),
    };

    errorRecovery.registerStrategy(failingStrategy);
    errorRecovery.registerStrategy(successStrategy);

    await errorRecovery.recover(new Error("test error"));

    expect(failingStrategy.action).toHaveBeenCalled();
    expect(successStrategy.action).toHaveBeenCalled();
  });
});
