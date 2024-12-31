import { EventEmitter } from '@/utils/EventEmitter';
import { ResourceType } from './ResourceManager';

interface ResourceBundle {
  id: string;
  name: string;
  description?: string;
  priority: number;
  resources: Array<{
    url: string;
    type: ResourceType;
    priority: number;
    size: number;
    required: boolean;
  }>;
  dependencies: string[];
  metadata?: Record<string, any>;
}

interface BundleLoadProgress {
  bundleId: string;
  loaded: number;
  total: number;
  percentage: number;
  currentItem?: string;
}

export class ResourceBundleManager extends EventEmitter {
  private static instance: ResourceBundleManager;
  private bundles: Map<string, ResourceBundle>;
  private loadedBundles: Set<string>;
  private loadingBundles: Set<string>;
  private bundleOrder: string[];
  private worker: Worker | null;

  private constructor() {
    super();
    this.bundles = new Map();
    this.loadedBundles = new Set();
    this.loadingBundles = new Set();
    this.bundleOrder = [];
    this.worker = null;
    this.initializeWorker();
  }

  static getInstance(): ResourceBundleManager {
    if (!ResourceBundleManager.instance) {
      ResourceBundleManager.instance = new ResourceBundleManager();
    }
    return ResourceBundleManager.instance;
  }

  private initializeWorker(): void {
    this.worker = new Worker(
      new URL('../workers/bundleLoader.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (event) => {
      const { type, data } = event.data;

      switch (type) {
        case 'progress':
          this.handleProgress(data);
          break;
        case 'complete':
          this.handleComplete(data);
          break;
        case 'error':
          this.handleError(data);
          break;
      }
    };
  }

  private handleProgress(data: BundleLoadProgress): void {
    this.emit('bundleProgress', data);
  }

  private handleComplete(data: { bundleId: string }): void {
    const { bundleId } = data;
    this.loadingBundles.delete(bundleId);
    this.loadedBundles.add(bundleId);
    this.emit('bundleLoaded', bundleId);
  }

  private handleError(data: { bundleId: string; error: string }): void {
    const { bundleId, error } = data;
    this.loadingBundles.delete(bundleId);
    this.emit('bundleError', { bundleId, error });
  }

  registerBundle(bundle: ResourceBundle): void {
    this.bundles.set(bundle.id, bundle);
    this.updateBundleOrder();
  }

  private updateBundleOrder(): void {
    // Create dependency graph
    const graph = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    for (const [id, bundle] of this.bundles) {
      graph.set(id, new Set(bundle.dependencies));
      inDegree.set(id, 0);
    }

    // Calculate in-degrees
    for (const dependencies of graph.values()) {
      for (const dep of dependencies) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Topological sort
    const queue: string[] = [];
    const result: string[] = [];

    // Add nodes with no dependencies
    for (const [id, degree] of inDegree) {
      if (degree === 0) {
        queue.push(id);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const id = queue.shift()!;
      result.push(id);

      // Update dependencies
      const dependencies = graph.get(id);
      if (dependencies) {
        for (const dep of dependencies) {
          const newDegree = (inDegree.get(dep) || 0) - 1;
          inDegree.set(dep, newDegree);
          if (newDegree === 0) {
            queue.push(dep);
          }
        }
      }
    }

    // Check for circular dependencies
    if (result.length !== this.bundles.size) {
      throw new Error('Circular dependencies detected in bundles');
    }

    // Sort by priority within dependency constraints
    result.sort((a, b) => {
      const bundleA = this.bundles.get(a);
      const bundleB = this.bundles.get(b);
      if (!bundleA || !bundleB) return 0;
      return bundleA.priority - bundleB.priority;
    });

    this.bundleOrder = result;
    this.emit('bundleOrderUpdated', result);
  }

  async loadBundle(bundleId: string, options: {
    force?: boolean;
    onProgress?: (progress: BundleLoadProgress) => void;
  } = {}): Promise<void> {
    const { force = false, onProgress } = options;

    // Check if bundle exists
    const bundle = this.bundles.get(bundleId);
    if (!bundle) {
      throw new Error(`Bundle ${bundleId} not found`);
    }

    // Check if already loaded
    if (!force && this.loadedBundles.has(bundleId)) {
      return;
    }

    // Check if already loading
    if (this.loadingBundles.has(bundleId)) {
      throw new Error(`Bundle ${bundleId} is already loading`);
    }

    // Check dependencies
    for (const depId of bundle.dependencies) {
      if (!this.loadedBundles.has(depId)) {
        throw new Error(
          `Bundle ${bundleId} requires ${depId} to be loaded first`
        );
      }
    }

    // Start loading
    this.loadingBundles.add(bundleId);
    this.emit('bundleLoadStart', bundleId);

    if (onProgress) {
      const handler = (progress: BundleLoadProgress) => {
        if (progress.bundleId === bundleId) {
          onProgress(progress);
        }
      };
      this.on('bundleProgress', handler);
    }

    try {
      // Send load request to worker
      this.worker?.postMessage({
        type: 'loadBundle',
        data: {
          bundle,
          force,
        },
      });

      // Wait for completion
      await new Promise<void>((resolve, reject) => {
        const handleComplete = (loadedBundleId: string) => {
          if (loadedBundleId === bundleId) {
            this.off('bundleLoaded', handleComplete);
            this.off('bundleError', handleError);
            if (onProgress) {
              this.off('bundleProgress', onProgress);
            }
            resolve();
          }
        };

        const handleError = (error: { bundleId: string; error: string }) => {
          if (error.bundleId === bundleId) {
            this.off('bundleLoaded', handleComplete);
            this.off('bundleError', handleError);
            if (onProgress) {
              this.off('bundleProgress', onProgress);
            }
            reject(new Error(error.error));
          }
        };

        this.on('bundleLoaded', handleComplete);
        this.on('bundleError', handleError);
      });
    } catch (error) {
      this.loadingBundles.delete(bundleId);
      throw error;
    }
  }

  async loadBundles(bundleIds: string[], options: {
    force?: boolean;
    parallel?: boolean;
    onProgress?: (progress: Record<string, BundleLoadProgress>) => void;
  } = {}): Promise<void> {
    const { force = false, parallel = false, onProgress } = options;

    if (parallel) {
      // Load all bundles in parallel
      await Promise.all(
        bundleIds.map((id) =>
          this.loadBundle(id, {
            force,
            onProgress: onProgress
              ? (progress) =>
                  onProgress({
                    [id]: progress,
                  })
              : undefined,
          })
        )
      );
    } else {
      // Load bundles sequentially
      for (const id of bundleIds) {
        await this.loadBundle(id, {
          force,
          onProgress: onProgress
            ? (progress) =>
                onProgress({
                  [id]: progress,
                })
            : undefined,
        });
      }
    }
  }

  unloadBundle(bundleId: string): void {
    // Check if bundle exists
    const bundle = this.bundles.get(bundleId);
    if (!bundle) {
      throw new Error(`Bundle ${bundleId} not found`);
    }

    // Check if any other bundles depend on this one
    for (const [id, otherBundle] of this.bundles) {
      if (id !== bundleId && otherBundle.dependencies.includes(bundleId)) {
        throw new Error(
          `Cannot unload bundle ${bundleId}: bundle ${id} depends on it`
        );
      }
    }

    // Unload bundle
    this.loadedBundles.delete(bundleId);
    this.emit('bundleUnloaded', bundleId);
  }

  isBundleLoaded(bundleId: string): boolean {
    return this.loadedBundles.has(bundleId);
  }

  isBundleLoading(bundleId: string): boolean {
    return this.loadingBundles.has(bundleId);
  }

  getBundleLoadOrder(): string[] {
    return [...this.bundleOrder];
  }

  dispose(): void {
    this.worker?.terminate();
    this.worker = null;
    this.bundles.clear();
    this.loadedBundles.clear();
    this.loadingBundles.clear();
    this.bundleOrder = [];
  }
}