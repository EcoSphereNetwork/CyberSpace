import { EventEmitter } from '@/utils/EventEmitter';
import { LayerType } from './LayerManager';

interface LayerDependency {
  layer: LayerType;
  requires: LayerType[];
  conflicts: LayerType[];
  priority: number;
  loadOrder: number;
  resources: Array<{
    url: string;
    type: 'texture' | 'model' | 'audio' | 'json';
    priority: number;
  }>;
}

export class LayerDependencyManager extends EventEmitter {
  private static instance: LayerDependencyManager;
  private dependencies: Map<LayerType, LayerDependency>;
  private loadOrder: LayerType[];
  private activeGroups: Set<string>;

  private constructor() {
    super();
    this.dependencies = new Map();
    this.loadOrder = [];
    this.activeGroups = new Set();
  }

  static getInstance(): LayerDependencyManager {
    if (!LayerDependencyManager.instance) {
      LayerDependencyManager.instance = new LayerDependencyManager();
    }
    return LayerDependencyManager.instance;
  }

  registerDependency(
    layer: LayerType,
    config: Omit<LayerDependency, 'layer'>
  ): void {
    this.dependencies.set(layer, {
      layer,
      ...config,
    });
    this.updateLoadOrder();
  }

  private updateLoadOrder(): void {
    // Create dependency graph
    const graph = new Map<LayerType, Set<LayerType>>();
    const inDegree = new Map<LayerType, number>();

    // Initialize graph
    for (const [layer, dependency] of this.dependencies) {
      graph.set(layer, new Set(dependency.requires));
      inDegree.set(layer, 0);
    }

    // Calculate in-degrees
    for (const dependencies of graph.values()) {
      for (const dep of dependencies) {
        inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
      }
    }

    // Topological sort
    const queue: LayerType[] = [];
    const result: LayerType[] = [];

    // Add nodes with no dependencies
    for (const [layer, degree] of inDegree) {
      if (degree === 0) {
        queue.push(layer);
      }
    }

    // Process queue
    while (queue.length > 0) {
      const layer = queue.shift()!;
      result.push(layer);

      // Update dependencies
      const dependencies = graph.get(layer);
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
    if (result.length !== this.dependencies.size) {
      throw new Error('Circular dependencies detected');
    }

    // Sort by priority within dependency constraints
    result.sort((a, b) => {
      const depA = this.dependencies.get(a);
      const depB = this.dependencies.get(b);
      if (!depA || !depB) return 0;
      return depA.priority - depB.priority;
    });

    this.loadOrder = result;
    this.emit('loadOrderUpdated', result);
  }

  getLoadOrder(): LayerType[] {
    return [...this.loadOrder];
  }

  getDependencies(layer: LayerType): LayerType[] {
    const dependency = this.dependencies.get(layer);
    return dependency ? [...dependency.requires] : [];
  }

  getConflicts(layer: LayerType): LayerType[] {
    const dependency = this.dependencies.get(layer);
    return dependency ? [...dependency.conflicts] : [];
  }

  validateLayerActivation(layer: LayerType): {
    valid: boolean;
    missingDependencies: LayerType[];
    conflicts: LayerType[];
  } {
    const dependency = this.dependencies.get(layer);
    if (!dependency) {
      return { valid: true, missingDependencies: [], conflicts: [] };
    }

    const missingDependencies = dependency.requires.filter(
      (dep) => !this.isLayerActive(dep)
    );

    const conflicts = dependency.conflicts.filter((conflict) =>
      this.isLayerActive(conflict)
    );

    return {
      valid: missingDependencies.length === 0 && conflicts.length === 0,
      missingDependencies,
      conflicts,
    };
  }

  isLayerActive(layer: LayerType): boolean {
    // This should be implemented based on your layer management system
    return true; // Placeholder
  }

  getResourceLoadOrder(): Array<{
    layer: LayerType;
    resources: LayerDependency['resources'];
  }> {
    return this.loadOrder
      .map((layer) => {
        const dependency = this.dependencies.get(layer);
        if (!dependency) return null;
        return {
          layer,
          resources: [...dependency.resources].sort(
            (a, b) => a.priority - b.priority
          ),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  addLayerGroup(name: string, layers: LayerType[]): void {
    // Validate group
    for (const layer of layers) {
      const validation = this.validateLayerActivation(layer);
      if (!validation.valid) {
        throw new Error(
          `Invalid layer group: ${layer} has unmet dependencies or conflicts`
        );
      }
    }

    // Store group
    this.emit('groupAdded', { name, layers });
  }

  activateGroup(name: string): void {
    this.activeGroups.add(name);
    this.emit('groupActivated', name);
  }

  deactivateGroup(name: string): void {
    this.activeGroups.delete(name);
    this.emit('groupDeactivated', name);
  }

  isGroupActive(name: string): boolean {
    return this.activeGroups.has(name);
  }

  dispose(): void {
    this.dependencies.clear();
    this.loadOrder = [];
    this.activeGroups.clear();
  }
}