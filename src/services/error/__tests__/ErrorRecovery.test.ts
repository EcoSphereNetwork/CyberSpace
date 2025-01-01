import { ErrorRecovery } from "../ErrorRecovery";

describe("ErrorRecovery", () => {
  let recovery: ErrorRecovery;

  beforeEach(() => {
    recovery = new ErrorRecovery();
  });

  it("registers recovery actions", () => {
    const action = jest.fn();
    recovery.register("test", action);

    expect(recovery.hasAction("test")).toBe(true);
  });

  it("executes recovery actions", async () => {
    const action = jest.fn().mockResolvedValue(undefined);
    recovery.register("test", action);

    await recovery.recover("test");
    expect(action).toHaveBeenCalled();
  });

  it("handles missing recovery actions", async () => {
    await expect(recovery.recover("nonexistent")).rejects.toThrow();
  });

  it("unregisters recovery actions", () => {
    const action = jest.fn();
    recovery.register("test", action);
    recovery.unregister("test");

    expect(recovery.hasAction("test")).toBe(false);
  });

  it("executes recovery actions with context", async () => {
    const action = jest.fn().mockResolvedValue(undefined);
    const context = { userId: "123" };
    recovery.register("test", action);

    await recovery.recover("test", context);
    expect(action).toHaveBeenCalledWith(context);
  });
});
