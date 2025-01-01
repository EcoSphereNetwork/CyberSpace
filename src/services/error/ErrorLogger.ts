export interface ErrorLogEntry {
  timestamp: string;
  error: Error;
  info?: Record<string, any>;
  context?: Record<string, any>;
}

export interface ErrorLoggerConfig {
  maxEntries?: number;
  persistToStorage?: boolean;
  reportToServer?: boolean;
  serverEndpoint?: string;
}

export class ErrorLogger {
  private static instance: ErrorLogger | null = null;
  private logs: ErrorLogEntry[] = [];
  private config: ErrorLoggerConfig;

  private constructor(config: ErrorLoggerConfig = {}) {
    this.config = {
      maxEntries: 100,
      persistToStorage: true,
      reportToServer: false,
      ...config,
    };

    if (this.config.persistToStorage) {
      this.loadFromStorage();
    }
  }

  public static getInstance(config?: ErrorLoggerConfig): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger(config);
    }
    return ErrorLogger.instance;
  }

  public log(error: Error, info?: Record<string, any>, context?: Record<string, any>): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error,
      info,
      context,
    };

    this.logs.unshift(entry);

    if (this.config.maxEntries && this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(0, this.config.maxEntries);
    }

    if (this.config.persistToStorage) {
      this.saveToStorage();
    }

    if (this.config.reportToServer) {
      this.reportToServer(entry);
    }

    console.error("Error logged:", entry);
  }

  public getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
    if (this.config.persistToStorage) {
      localStorage.removeItem("errorLogs");
    }
  }

  private loadFromStorage(): void {
    try {
      const storedLogs = localStorage.getItem("errorLogs");
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      console.error("Failed to load error logs from storage:", error);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem("errorLogs", JSON.stringify(this.logs));
    } catch (error) {
      console.error("Failed to save error logs to storage:", error);
    }
  }

  private async reportToServer(entry: ErrorLogEntry): Promise<void> {
    if (!this.config.serverEndpoint) return;

    try {
      const response = await fetch(this.config.serverEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error(`Failed to report error: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to report error to server:", error);
    }
  }
}
