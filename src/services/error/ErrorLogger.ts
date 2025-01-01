export interface ErrorLogEntry {
  timestamp: string;
  error: Error;
  context?: any;
  info?: any;
}

export class ErrorLogger {
  private logs: ErrorLogEntry[] = [];

  public log(error: Error, context?: any, info?: any): void {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      error,
      context,
      info,
    };

    this.logs.push(entry);
    console.error("Error logged:", entry);
  }

  public getLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  public clear(): void {
    this.logs = [];
  }
}
