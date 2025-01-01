import { EventEmitter } from '@/utils/EventEmitter';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
  metadata?: Record<string, any>;
}

export class NotificationSystem extends EventEmitter {
  private notifications: Map<string, Notification>;
  private idCounter: number;

  constructor() {
    super();
    this.notifications = new Map();
    this.idCounter = 0;
  }

  initialize(): Promise<void> {
    return Promise.resolve();
  }

  shutdown(): Promise<void> {
    this.notifications.clear();
    return Promise.resolve();
  }

  show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = `notification_${++this.idCounter}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    };

    this.notifications.set(id, fullNotification);
    this.emit('notification', fullNotification);

    if (notification.duration) {
      setTimeout(() => {
        this.dismiss(id);
      }, notification.duration);
    }

    return id;
  }

  info(title: string, message: string, options: Partial<Notification> = {}): string {
    return this.show({
      type: 'info',
      title,
      message,
      ...options,
    });
  }

  success(title: string, message: string, options: Partial<Notification> = {}): string {
    return this.show({
      type: 'success',
      title,
      message,
      ...options,
    });
  }

  warning(title: string, message: string, options: Partial<Notification> = {}): string {
    return this.show({
      type: 'warning',
      title,
      message,
      ...options,
    });
  }

  error(title: string, message: string, options: Partial<Notification> = {}): string {
    return this.show({
      type: 'error',
      title,
      message,
      ...options,
    });
  }

  dismiss(id: string): boolean {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.delete(id);
      this.emit('dismiss', notification);
      return true;
    }
    return false;
  }

  dismissAll(): void {
    const notifications = Array.from(this.notifications.values());
    this.notifications.clear();
    notifications.forEach((notification) => {
      this.emit('dismiss', notification);
    });
  }

  getNotification(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  getNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp - a.timestamp
    );
  }

  clear(): void {
    this.notifications.clear();
    this.emit('clear');
  }
}
