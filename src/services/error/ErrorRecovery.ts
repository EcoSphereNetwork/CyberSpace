export type RecoveryAction = (context?: any) => Promise<void>;

export class ErrorRecovery {
  private actions: Map<string, RecoveryAction> = new Map();

  public register(key: string, action: RecoveryAction): void {
    this.actions.set(key, action);
  }

  public unregister(key: string): void {
    this.actions.delete(key);
  }

  public hasAction(key: string): boolean {
    return this.actions.has(key);
  }

  public async recover(key: string, context?: any): Promise<void> {
    const action = this.actions.get(key);
    if (!action) {
      throw new Error(`No recovery action found for key: ${key}`);
    }

    await action(context);
  }
}
