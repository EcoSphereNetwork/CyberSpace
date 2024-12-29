import { EventEmitter } from '@/utils/EventEmitter';
import { Vector3, Object3D, Material, Texture } from 'three';

export interface LayerConfig {
  id: string;
  name: string;
  visible?: boolean;
  opacity?: number;
  position?: Vector3;
  renderOrder?: number;
  interactive?: boolean;
  metadata?: Record<string, any>;
}

export interface LayerState {
  visible: boolean;
  opacity: number;
  position: Vector3;
  renderOrder: number;
  interactive: boolean;
  loaded: boolean;
  active: boolean;
  error: Error | null;
}

export interface LayerResources {
  objects: Map<string, Object3D>;
  materials: Map<string, Material>;
  textures: Map<string, Texture>;
}

/**
 * Base class for all layers
 */
export abstract class Layer extends EventEmitter {
  protected readonly config: LayerConfig;
  protected state: LayerState;
  protected resources: LayerResources;
  protected root: Object3D;

  constructor(config: LayerConfig) {
    super();

    this.config = config;
    this.root = new Object3D();
    this.root.name = config.id;

    // Initialize state
    this.state = {
      visible: config.visible ?? true,
      opacity: config.opacity ?? 1,
      position: config.position ?? new Vector3(),
      renderOrder: config.renderOrder ?? 0,
      interactive: config.interactive ?? true,
      loaded: false,
      active: false,
      error: null
    };

    // Initialize resources
    this.resources = {
      objects: new Map(),
      materials: new Map(),
      textures: new Map()
    };

    // Apply initial state
    this.root.visible = this.state.visible;
    this.root.position.copy(this.state.position);
    this.root.renderOrder = this.state.renderOrder;
  }

  /**
   * Initialize the layer
   */
  public async initialize(): Promise<void> {
    if (this.state.loaded) {
      return;
    }

    try {
      await this.loadResources();
      await this.setup();
      
      this.state.loaded = true;
      this.emit('loaded');
    } catch (error) {
      this.state.error = error instanceof Error ? error : new Error('Failed to initialize layer');
      this.emit('error', this.state.error);
      throw this.state.error;
    }
  }

  /**
   * Load layer resources
   */
  protected abstract loadResources(): Promise<void>;

  /**
   * Setup layer after resources are loaded
   */
  protected abstract setup(): Promise<void>;

  /**
   * Update layer
   */
  public update(deltaTime: number): void {
    if (!this.state.active || !this.state.loaded) {
      return;
    }

    this.updateLayer(deltaTime);
  }

  /**
   * Update layer implementation
   */
  protected abstract updateLayer(deltaTime: number): void;

  /**
   * Activate layer
   */
  public async activate(): Promise<void> {
    if (!this.state.loaded) {
      await this.initialize();
    }

    if (!this.state.active) {
      this.state.active = true;
      this.emit('activated');
    }
  }

  /**
   * Deactivate layer
   */
  public async deactivate(): Promise<void> {
    if (this.state.active) {
      this.state.active = false;
      this.emit('deactivated');
    }
  }

  /**
   * Dispose layer resources
   */
  public dispose(): void {
    // Dispose resources
    this.resources.objects.forEach(object => {
      object.traverse(child => {
        if (child instanceof Object3D) {
          child.removeFromParent();
        }
      });
    });

    this.resources.materials.forEach(material => {
      material.dispose();
    });

    this.resources.textures.forEach(texture => {
      texture.dispose();
    });

    // Clear maps
    this.resources.objects.clear();
    this.resources.materials.clear();
    this.resources.textures.clear();

    // Remove root
    this.root.removeFromParent();

    // Reset state
    this.state.loaded = false;
    this.state.active = false;

    this.emit('disposed');
  }

  /**
   * Set layer visibility
   */
  public setVisible(visible: boolean): void {
    this.state.visible = visible;
    this.root.visible = visible;
    this.emit('visibilityChanged', visible);
  }

  /**
   * Set layer opacity
   */
  public setOpacity(opacity: number): void {
    this.state.opacity = opacity;
    this.resources.materials.forEach(material => {
      if ('opacity' in material) {
        material.opacity = opacity;
        material.transparent = opacity < 1;
        material.needsUpdate = true;
      }
    });
    this.emit('opacityChanged', opacity);
  }

  /**
   * Set layer position
   */
  public setPosition(position: Vector3): void {
    this.state.position.copy(position);
    this.root.position.copy(position);
    this.emit('positionChanged', position);
  }

  /**
   * Set layer render order
   */
  public setRenderOrder(order: number): void {
    this.state.renderOrder = order;
    this.root.renderOrder = order;
    this.root.traverse(child => {
      child.renderOrder = order;
    });
    this.emit('renderOrderChanged', order);
  }

  /**
   * Set layer interactivity
   */
  public setInteractive(interactive: boolean): void {
    this.state.interactive = interactive;
    this.emit('interactivityChanged', interactive);
  }

  /**
   * Get layer state
   */
  public getState(): Readonly<LayerState> {
    return { ...this.state };
  }

  /**
   * Get layer config
   */
  public getConfig(): Readonly<LayerConfig> {
    return { ...this.config };
  }

  /**
   * Get layer root object
   */
  public getRoot(): Object3D {
    return this.root;
  }

  /**
   * Get layer object by ID
   */
  public getObject(id: string): Object3D | undefined {
    return this.resources.objects.get(id);
  }

  /**
   * Get layer material by ID
   */
  public getMaterial(id: string): Material | undefined {
    return this.resources.materials.get(id);
  }

  /**
   * Get layer texture by ID
   */
  public getTexture(id: string): Texture | undefined {
    return this.resources.textures.get(id);
  }
}