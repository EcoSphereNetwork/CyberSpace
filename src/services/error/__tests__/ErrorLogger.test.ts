import { ErrorLogger } from "../ErrorLogger";

describe("ErrorLogger", () => {
  let logger: ErrorLogger;

  beforeEach(() => {
    logger = new ErrorLogger();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("logs errors with timestamp", () => {
    const error = new Error("Test error");
    logger.log(error);

    const logs = logger.getLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].error).toBe(error);
    expect(logs[0].timestamp).toBeDefined();
  });

  it("maintains error history", () => {
    const error1 = new Error("Error 1");
    const error2 = new Error("Error 2");

    logger.log(error1);
    logger.log(error2);

    const logs = logger.getLogs();
    expect(logs).toHaveLength(2);
    expect(logs[0].error).toBe(error1);
    expect(logs[1].error).toBe(error2);
  });

  it("clears error history", () => {
    const error = new Error("Test error");
    logger.log(error);
    logger.clear();

    const logs = logger.getLogs();
    expect(logs).toHaveLength(0);
  });

  it("logs errors with context", () => {
    const error = new Error("Test error");
    const context = { userId: "123", action: "test" };
    logger.log(error, context);

    const logs = logger.getLogs();
    expect(logs[0].context).toBe(context);
  });

  it("logs errors with additional info", () => {
    const error = new Error("Test error");
    const info = { details: "Additional information" };
    logger.log(error, undefined, info);

    const logs = logger.getLogs();
    expect(logs[0].info).toBe(info);
  });
});
