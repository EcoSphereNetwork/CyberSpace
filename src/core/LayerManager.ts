import * as THREE from 'three';
import { NetworkLayer } from '@/layers/network/NetworkLayer';
import { ResourceManager } from './ResourceManager';
import { LoadingManager } from './LoadingManager';
import { EventEmitter } from '@/utils/EventEmitter';

export type LayerType = 'network' | 'data' | 'ui';

interface LayerConfig {
  type: LayerType;
  name: string;
  description: string;
  visible: boolean;
  enabled: boolean;
  resources: Array<{
    url: string;
    type: 'texture' | 'model' | 'audio' | 'json';
  }>;
}

export class LayerManager extends EventEmitter {
  private static instance: LayerManager;
  private layers: Map<LayerType, any>;
  private configs: Map<LayerType, LayerConfig>;
  private scene: THREE.Scene | null;
  private resourceManager: ResourceManager;
  private loadingManager: LoadingManager;

  private constructor() {
    super();
    this.layers = new Map();
    this.configs = new Map();
    this.scene = null;
    this.resourceManager = ResourceManager.getInstance();
    this.loadingManager = LoadingManager.getInstance();
    this.initializeConfigs();
  }

  static getInstance(): LayerManager {
    if (!LayerManager.instance) {
      LayerManager.instance = new LayerManager();
    }
    return LayerManager.instance;
  }

  private initializeConfigs(): void {
    // Define layer configurations
    const configs: Record<LayerType, LayerConfig> = {
      network: {
        type: 'network',
        name: 'Network Layer',
        description: 'Network topology and traffic visualization',
        visible: true,
        enabled: true,
        resources: [
          { url: '/models/node.glb', type: 'model' },
          { url: '/textures/node.jpg', type: 'texture' },
          { url: '/data/network.json', type: 'json' },
        ],
      },
      data: {
        type: 'data',
        name: 'Data Layer',
        description: 'Data flow and analytics visualization',
        visible: true,
        enabled: true,
        resources: [
          { url: '/data/flows.json', type: 'json' },
          { url: '/textures/particle.png', type: 'texture' },
        ],
      },
      ui: {
        type: 'ui',
        name: 'UI Layer',
        description: 'User interface elements',
        visible: true,
        enabled: true,
        resources: [
          { url: '/textures/icons.png', type: 'texture' },
          { url: '/data/ui.json', type: 'json' },
        ],
      },
    };

    // Store configurations
    for (const [type, config] of Object.entries(configs)) {
      this.configs.set(type as LayerType, config);
    }
  }

  initialize(scene: THREE.Scene): void {
    this.scene = scene;
    this.emit('initialized');
  }

  async loadLayers(types: LayerType[]): Promise<void> {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    // Add loading items
    for (const type of types) {
      const config = this.configs.get(type);
      if (config) {
        this.loadingManager.addItem(`layer_${type}`);
      }
    }

    // Load layers
    for (const type of types) {
      try {
        // Check if layer already exists
        if (this.layers.has(type)) continue;

        // Get layer config
        const config = this.configs.get(type);
        if (!config) {
          throw new Error(`Layer ${type} not found`);
        }

        // Set current item
        this.loadingManager.setCurrentItem(`Loading layer: ${config.name}`);

        // Load layer resources
        await this.resourceManager.preload(config.resources);

        // Create layer instance
        let layer;
        switch (type) {
          case 'network':
            layer = new NetworkLayer(this.scene);
            break;
          case 'data':
            // TODO: Implement DataLayer
            break;
          case 'ui':
            // TODO: Implement UILayer
            break;
          default:
            throw new Error(`Unknown layer type: ${type}`);
        }

        // Store layer
        if (layer) {
          this.layers.set(type, layer);
          this.emit('layerLoaded', type);
        }

        // Complete loading item
        this.loadingManager.completeItem(`layer_${type}`);
      } catch (error) {
        console.error(`Failed to load layer ${type}:`, error);
        this.loadingManager.completeItem(`layer_${type}`);
        throw error;
      }
    }

    // Emit initialization complete event
    this.emit('initialized');
  }

  getLayer<T>(type: LayerType): T | undefined {
    return this.layers.get(type) as T;
  }

  setLayerVisibility(type: LayerType, visible: boolean): void {
    const layer = this.layers.get(type);
    if (layer && typeof layer.setVisible === 'function') {
      layer.setVisible(visible);
      
      const config = this.configs.get(type);
      if (config) {
        config.visible = visible;
      }

      this.emit('layerVisibilityChanged', { type, visible });
    }
  }

  setLayerEnabled(type: LayerType, enabled: boolean): void {
    const layer = this.layers.get(type);
    if (layer && typeof layer.setEnabled === 'function') {
      layer.setEnabled(enabled);
      
      const config = this.configs.get(type);
      if (config) {
        config.enabled = enabled;
      }

      this.emit('layerEnabledChanged', { type, enabled });
    }
  }

  getLayers(): Map<LayerType, any> {
    return new Map(this.layers);
  }

  getConfig(type: LayerType): LayerConfig | undefined {
    return this.configs.get(type);
  }

  getConfigs(): Map<LayerType, LayerConfig> {
    return new Map(this.configs);
  }

  update(deltaTime: number): void {
    // Update all layers
    for (const [type, layer] of this.layers) {
      const config = this.configs.get(type);
      if (config?.enabled && typeof layer.update === 'function') {
        layer.update(deltaTime);
      }
    }
  }

  dispose(): void {
    // Dispose all layers
    for (const layer of this.layers.values()) {
      if (layer && typeof layer.dispose === 'function') {
        layer.dispose();
      }
    }

    this.layers.clear();
    this.scene = null;
  }
}
