import { EventEmitter } from '@/utils/EventEmitter';
import { Layer, LayerConfig } from './Layer';
import { Scene } from 'three';

interface LayerManagerConfig {
  maxLayers?: number;
  autoActivate?: boolean;
  updateInterval?: number;
}

interface LayerInstance {
  config: LayerConfig;
  instance: Layer;
}

/**
 * Manages layer lifecycle and interactions
 */
export class LayerManager extends EventEmitter {
  private readonly config: Required<LayerManagerConfig>;
  private readonly layers: Map<string, LayerInstance>;
  private readonly scene: Scene;
  private updateInterval: number | null;

  constructor(scene: Scene, config: LayerManagerConfig = {}) {
    super();

    this.config = {
      maxLayers: config.maxLayers ?? 100,
      autoActivate: config.autoActivate ?? true,
      updateInterval: config.updateInterval ?? 1000 / 60, // 60 FPS
    };

    this.scene = scene;
    this.layers = new Map();
    this.updateInterval = null;

    // Bind methods
    this.update = this.update.bind(this);
  }

  /**
   * Initialize layer manager
   */
  public async initialize(): Promise<void> {
    // Start update loop
    this.updateInterval = window.setInterval(
      this.update,
      this.config.updateInterval
    );

    this.emit('initialized');
  }

  /**
   * Shutdown layer manager
   */
  public async shutdown(): Promise<void> {
    // Stop update loop
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Dispose all layers
    for (const [layerId, layer] of this.layers) {
      await this.removeLayer(layerId);
    }

    this.emit('shutdown');
  }

  /**
   * Add a layer
   */
  public async addLayer(
    layerClass: typeof Layer,
    config: LayerConfig
  ): Promise<void> {
    if (this.layers.size >= this.config.maxLayers) {
      throw new Error('Maximum number of layers reached');
    }

    if (this.layers.has(config.id)) {
      throw new Error(`Layer ${config.id} already exists`);
    }

    // Create layer instance
    const layer = new layerClass(config);

    // Add to scene
    this.scene.add(layer.getRoot());

    // Store layer
    this.layers.set(config.id, {
      config,
      instance: layer,
    });

    // Initialize layer
    await layer.initialize();

    // Auto-activate if configured
    if (this.config.autoActivate) {
      await layer.activate();
    }

    this.emit('layerAdded', config.id);
  }

  /**
   * Remove a layer
   */
  public async removeLayer(layerId: string): Promise<void> {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} does not exist`);
    }

    // Deactivate and dispose
    await layer.instance.deactivate();
    layer.instance.dispose();

    // Remove from scene
    this.scene.remove(layer.instance.getRoot());

    // Remove from layers
    this.layers.delete(layerId);

    this.emit('layerRemoved', layerId);
  }

  /**
   * Activate a layer
   */
  public async activateLayer(layerId: string): Promise<void> {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} does not exist`);
    }

    await layer.instance.activate();
    this.emit('layerActivated', layerId);
  }

  /**
   * Deactivate a layer
   */
  public async deactivateLayer(layerId: string): Promise<void> {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} does not exist`);
    }

    await layer.instance.deactivate();
    this.emit('layerDeactivated', layerId);
  }

  /**
   * Set layer visibility
   */
  public setLayerVisible(layerId: string, visible: boolean): void {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} does not exist`);
    }

    layer.instance.setVisible(visible);
  }

  /**
   * Set layer opacity
   */
  public setLayerOpacity(layerId: string, opacity: number): void {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} does not exist`);
    }

    layer.instance.setOpacity(opacity);
  }

  /**
   * Set layer render order
   */
  public setLayerRenderOrder(layerId: string, order: number): void {
    const layer = this.layers.get(layerId);
    if (!layer) {
      throw new Error(`Layer ${layerId} does not exist`);
    }

    layer.instance.setRenderOrder(order);
  }

  /**
   * Update all active layers
   */
  private update(): void {
    const deltaTime = this.config.updateInterval / 1000;

    for (const [layerId, layer] of this.layers) {
      try {
        layer.instance.update(deltaTime);
      } catch (error) {
        console.error(`Error updating layer ${layerId}:`, error);
        this.emit('error', { layerId, error });
      }
    }
  }

  /**
   * Get layer instance
   */
  public getLayer(layerId: string): Layer | null {
    return this.layers.get(layerId)?.instance ?? null;
  }

  /**
   * Get all layer IDs
   */
  public getLayerIds(): string[] {
    return Array.from(this.layers.keys());
  }

  /**
   * Get layer config
   */
  public getLayerConfig(layerId: string): LayerConfig | null {
    return this.layers.get(layerId)?.config ?? null;
  }

  /**
   * Check if layer exists
   */
  public hasLayer(layerId: string): boolean {
    return this.layers.has(layerId);
  }

  /**
   * Check if layer is active
   */
  public isLayerActive(layerId: string): boolean {
    return this.layers.get(layerId)?.instance.getState().active ?? false;
  }

  /**
   * Get layer count
   */
  public getLayerCount(): number {
    return this.layers.size;
  }
}
