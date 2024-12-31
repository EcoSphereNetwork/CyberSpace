import { EventEmitter } from '@/utils/EventEmitter';

export interface LoadingProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentItem?: string;
}

export class LoadingManager extends EventEmitter {
  private static instance: LoadingManager;
  private items: Map<string, boolean>;
  private currentProgress: LoadingProgress;

  private constructor() {
    super();
    this.items = new Map();
    this.currentProgress = {
      total: 0,
      loaded: 0,
      percentage: 0,
    };
  }

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  addItem(id: string): void {
    if (!this.items.has(id)) {
      this.items.set(id, false);
      this.updateProgress();
    }
  }

  completeItem(id: string): void {
    if (this.items.has(id) && !this.items.get(id)) {
      this.items.set(id, true);
      this.updateProgress();
    }
  }

  setCurrentItem(id: string): void {
    this.currentProgress.currentItem = id;
    this.emit('progress', this.currentProgress);
  }

  private updateProgress(): void {
    const total = this.items.size;
    const loaded = Array.from(this.items.values()).filter(Boolean).length;
    const percentage = total > 0 ? (loaded / total) * 100 : 0;

    this.currentProgress = {
      total,
      loaded,
      percentage,
      currentItem: this.currentProgress.currentItem,
    };

    this.emit('progress', this.currentProgress);

    if (loaded === total && total > 0) {
      this.emit('complete');
    }
  }

  reset(): void {
    this.items.clear();
    this.currentProgress = {
      total: 0,
      loaded: 0,
      percentage: 0,
    };
    this.emit('progress', this.currentProgress);
  }

  getProgress(): LoadingProgress {
    return { ...this.currentProgress };
  }
}