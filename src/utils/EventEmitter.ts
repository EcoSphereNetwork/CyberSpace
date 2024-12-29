type EventHandler = (...args: any[]) => void;

interface EventMap {
  [event: string]: EventHandler[];
}

/**
 * Simple event emitter implementation
 */
export class EventEmitter {
  private events: EventMap = {};

  /**
   * Add an event listener
   */
  public on(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  /**
   * Add a one-time event listener
   */
  public once(event: string, handler: EventHandler): void {
    const onceHandler = (...args: any[]) => {
      this.off(event, onceHandler);
      handler.apply(this, args);
    };
    this.on(event, onceHandler);
  }

  /**
   * Remove an event listener
   */
  public off(event: string, handler: EventHandler): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter(h => h !== handler);
    if (this.events[event].length === 0) {
      delete this.events[event];
    }
  }

  /**
   * Remove all event listeners
   */
  public removeAllListeners(event?: string): void {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }

  /**
   * Emit an event
   */
  public emit(event: string, ...args: any[]): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach(handler => {
      try {
        handler.apply(this, args);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }

  /**
   * Get event listener count
   */
  public listenerCount(event: string): number {
    return this.events[event]?.length ?? 0;
  }

  /**
   * Get event names
   */
  public eventNames(): string[] {
    return Object.keys(this.events);
  }

  /**
   * Get listeners for an event
   */
  public listeners(event: string): EventHandler[] {
    return this.events[event] ?? [];
  }
}