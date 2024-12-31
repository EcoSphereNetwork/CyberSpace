import { Scene } from 'three';
import { EventEmitter } from '@/utils/EventEmitter';
import { NetworkLayer } from '@/layers/network/NetworkLayer';

export type LayerType = 'network' | 'data' | 'ui';

interface LayerConfig {
  type: LayerType;
  name: string;
  description: string;
  visible: boolean;
  enabled: boolean;
}

export class LayerManager extends EventEmitter {
  private static instance: LayerManager;
  private layers: Map<LayerType, any>;
  private configs: Map<LayerType, LayerConfig>;
  private scene: Scene | null;

  private constructor() {
    super();
    this.layers = new Map();
    this.configs = new Map();
    this.scene = null;
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
      },
      data: {
        type: 'data',
        name: 'Data Layer',
        description: 'Data flow and analytics visualization',
        visible: true,
        enabled: true,
      },
      ui: {
        type: 'ui',
        name: 'UI Layer',
        description: 'User interface elements',
        visible: true,
        enabled: true,
      },
    };

    // Store configurations
    for (const config of Object.values(configs)) {
      this.configs.set(config.type, config);
    }
  }

  initialize(scene: Scene): void {
    this.scene = scene;
    this.initializeLayers();
  }

  private initializeLayers(): void {
    if (!this.scene) {
      throw new Error('Scene not initialized');
    }

    // Initialize network layer
    const networkLayer = new NetworkLayer(this.scene);
    this.layers.set('network', networkLayer);

    // Initialize other layers as needed
    // ...

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