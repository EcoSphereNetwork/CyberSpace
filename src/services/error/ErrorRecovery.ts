export interface RecoveryStrategy {
  name: string;
  condition: (error: Error) => boolean;
  action: (error: Error) => Promise<void>;
}

export class ErrorRecovery {
  private static instance: ErrorRecovery | null = null;
  private strategies: Map<string, RecoveryStrategy> = new Map();

  private constructor() {
    this.registerDefaultStrategies();
  }

  public static getInstance(): ErrorRecovery {
    if (!ErrorRecovery.instance) {
      ErrorRecovery.instance = new ErrorRecovery();
    }
    return ErrorRecovery.instance;
  }

  public registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  public removeStrategy(name: string): void {
    this.strategies.delete(name);
  }

  public async recover(error: Error): Promise<void> {
    for (const strategy of this.strategies.values()) {
      if (strategy.condition(error)) {
        try {
          await strategy.action(error);
          return;
        } catch (recoveryError) {
          console.error(`Recovery strategy ${strategy.name} failed:`, recoveryError);
        }
      }
    }

    throw new Error(`No recovery strategy found for error: ${error.message}`);
  }

  private registerDefaultStrategies(): void {
    // Network error recovery
    this.registerStrategy({
      name: "networkRetry",
      condition: (error) => error.message.includes("network") || error.message.includes("fetch"),
      action: async () => {
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
          try {
            // Retry the failed request
            // This is a placeholder - actual implementation would need the original request details
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
            return;
          } catch (retryError) {
            retryCount++;
            if (retryCount === maxRetries) {
              throw new Error(`Network retry failed after ${maxRetries} attempts`);
            }
          }
        }
      },
    });

    // Resource loading error recovery
    this.registerStrategy({
      name: "resourceRetry",
      condition: (error) => error.message.includes("resource") || error.message.includes("loading"),
      action: async () => {
        try {
          // Clear resource cache
          await caches.delete("resources");
          // Reload the page
          window.location.reload();
        } catch (clearError: any) {
          throw new Error(`Failed to clear resource cache: ${clearError.message}`);
        }
      },
    });

    // State corruption recovery
    this.registerStrategy({
      name: "stateReset",
      condition: (error) => error.message.includes("state") || error.message.includes("corruption"),
      action: async () => {
        try {
          // Clear local storage
          localStorage.clear();
          // Clear session storage
          sessionStorage.clear();
          // Reload the page
          window.location.reload();
        } catch (clearError: any) {
          throw new Error(`Failed to clear application state: ${clearError.message}`);
        }
      },
    });
  }
}
