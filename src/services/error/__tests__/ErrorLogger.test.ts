import { ErrorLogger } from "../ErrorLogger";

describe("ErrorLogger", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("creates a singleton instance", () => {
    const logger1 = ErrorLogger.getInstance();
    const logger2 = ErrorLogger.getInstance();
    expect(logger1).toBe(logger2);
  });

  it("logs errors with timestamp", () => {
    const logger = ErrorLogger.getInstance();
    const error = new Error("Test error");
    logger.log(error);
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].error).toBe(error);
    expect(logs[0].timestamp).toBeDefined();
  });

  it("respects maxEntries config", () => {
    const logger = ErrorLogger.getInstance({ maxEntries: 2 });
    logger.log(new Error("Error 1"));
    logger.log(new Error("Error 2"));
    logger.log(new Error("Error 3"));
    const logs = logger.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].error.message).toBe("Error 3");
    expect(logs[1].error.message).toBe("Error 2");
  });

  it("persists logs to localStorage", () => {
    const logger = ErrorLogger.getInstance({ persistToStorage: true });
    const error = new Error("Test error");
    logger.log(error);
    const storedLogs = localStorage.getItem("errorLogs");
    expect(storedLogs).toBeDefined();
    const parsedLogs = JSON.parse(storedLogs!);
    expect(parsedLogs).toHaveLength(1);
    expect(parsedLogs[0].error.message).toBe("Test error");
  });

  it("loads logs from localStorage on initialization", () => {
    const initialLogs = [
      {
        timestamp: new Date().toISOString(),
        error: { message: "Test error" },
      },
    ];
    localStorage.setItem("errorLogs", JSON.stringify(initialLogs));

    const logger = ErrorLogger.getInstance({ persistToStorage: true });
    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].error.message).toBe("Test error");
  });

  it("clears logs", () => {
    const logger = ErrorLogger.getInstance();
    logger.log(new Error("Test error"));
    expect(logger.getLogs()).toHaveLength(1);
    logger.clearLogs();
    expect(logger.getLogs()).toHaveLength(0);
  });

  it("reports errors to server when configured", async () => {
    const mockFetch = jest.fn().mockResolvedValue({ ok: true });
    global.fetch = mockFetch;

    const logger = ErrorLogger.getInstance({
      reportToServer: true,
      serverEndpoint: "http://example.com/errors",
    });

    const error = new Error("Test error");
    await logger.log(error);

    expect(mockFetch).toHaveBeenCalledWith(
      "http://example.com/errors",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: expect.any(String),
      })
    );
  });
});
