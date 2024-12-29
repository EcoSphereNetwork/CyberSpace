import { EventEmitter } from '@/utils/EventEmitter';
import { Layer, LayerConfig } from './Layer';
import { LayerManager } from './LayerManager';
import { Vector3, Object3D, Scene, WebGLRenderer, Camera } from 'three';
import { gsap } from 'gsap';

interface LayerTransition {
  from: string;
  to: string;
  duration?: number;
  easing?: string;
  type?: 'fade' | 'slide' | 'zoom' | 'custom';
  direction?: 'left' | 'right' | 'up' | 'down';
  onStart?: () => void;
  onComplete?: () => void;
  metadata?: Record<string, any>;
}

interface LayerBlend {
  layers: string[];
  mode: 'add' | 'multiply' | 'screen' | 'overlay' | 'custom';
  opacity?: number;
  mask?: {
    texture?: string;
    color?: number;
    invert?: boolean;
  };
  metadata?: Record<string, any>;
}

interface LayerGroup {
  id: string;
  layers: string[];
  active: boolean;
  transition?: Partial<LayerTransition>;
  blend?: Partial<LayerBlend>;
  metadata?: Record<string, any>;
}

interface LayerPreset {
  id: string;
  layers: {
    id: string;
    config: Partial<LayerConfig>;
  }[];
  groups?: LayerGroup[];
  transition?: Partial<LayerTransition>;
  metadata?: Record<string, any>;
}

interface LayerIntegrationConfig {
  defaultTransition?: Partial<LayerTransition>;
  defaultBlend?: Partial<LayerBlend>;
  presets?: LayerPreset[];
  maxActiveGroups?: number;
}

/**
 * Manages layer interactions, transitions, and blending
 */
export class LayerIntegration extends EventEmitter {
  private readonly config: Required<LayerIntegrationConfig>;
  private readonly layerManager: LayerManager;
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private readonly camera: Camera;

  private activeTransitions: Map<string, gsap.core.Tween>;
  private activeBlends: Map<string, LayerBlend>;
  private groups: Map<string, LayerGroup>;
  private presets: Map<string, LayerPreset>;

  constructor(
    layerManager: LayerManager,
    scene: Scene,
    renderer: WebGLRenderer,
    camera: Camera,
    config: LayerIntegrationConfig = {}
  ) {
    super();

    this.layerManager = layerManager;
    this.scene = scene;
    this.renderer = renderer;
    this.camera = camera;

    this.config = {
      defaultTransition: {
        duration: 1,
        easing: 'power2.inOut',
        type: 'fade',
        ...config.defaultTransition
      },
      defaultBlend: {
        mode: 'add',
        opacity: 1,
        ...config.defaultBlend
      },
      presets: config.presets ?? [],
      maxActiveGroups: config.maxActiveGroups ?? 10
    };

    this.activeTransitions = new Map();
    this.activeBlends = new Map();
    this.groups = new Map();
    this.presets = new Map();

    // Initialize presets
    this.config.presets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }

  /**
   * Transition between layers
   */
  public async transition(config: LayerTransition): Promise<void> {
    const fromLayer = this.layerManager.getLayer(config.from);
    const toLayer = this.layerManager.getLayer(config.to);

    if (!fromLayer || !toLayer) {
      throw new Error(\`Invalid layers: \${config.from} -> \${config.to}\`);
    }

    // Cancel existing transition for these layers
    this.cancelTransition(config.from);
    this.cancelTransition(config.to);

    // Merge with default config
    const transitionConfig: Required<LayerTransition> = {
      ...this.config.defaultTransition,
      ...config
    };

    // Setup transition
    const transition = {
      progress: 0,
      fromOpacity: 1,
      toOpacity: 0,
      fromScale: 1,
      toScale: 1,
      fromPosition: new Vector3(),
      toPosition: new Vector3()
    };

    // Create GSAP timeline
    const tl = gsap.timeline({
      onStart: () => {
        transitionConfig.onStart?.();
        this.emit('transitionStart', transitionConfig);
      },
      onComplete: () => {
        transitionConfig.onComplete?.();
        this.emit('transitionComplete', transitionConfig);
        this.activeTransitions.delete(config.from);
        this.activeTransitions.delete(config.to);
      }
    });

    // Setup transition based on type
    switch (transitionConfig.type) {
      case 'fade':
        tl.to(transition, {
          duration: transitionConfig.duration,
          ease: transitionConfig.easing,
          progress: 1,
          fromOpacity: 0,
          toOpacity: 1,
          onUpdate: () => {
            fromLayer.setOpacity(transition.fromOpacity);
            toLayer.setOpacity(transition.toOpacity);
          }
        });
        break;

      case 'slide':
        const direction = transitionConfig.direction ?? 'right';
        const offset = 100;
        let x = 0, y = 0;

        switch (direction) {
          case 'left':
            x = -offset;
            break;
          case 'right':
            x = offset;
            break;
          case 'up':
            y = -offset;
            break;
          case 'down':
            y = offset;
            break;
        }

        tl.set(transition.toPosition, { x: x, y: y })
          .to([transition, transition.toPosition], {
            duration: transitionConfig.duration,
            ease: transitionConfig.easing,
            progress: 1,
            x: 0,
            y: 0,
            fromOpacity: 0,
            toOpacity: 1,
            onUpdate: () => {
              fromLayer.setOpacity(transition.fromOpacity);
              toLayer.setOpacity(transition.toOpacity);
              toLayer.getRoot().position.copy(transition.toPosition);
            }
          });
        break;

      case 'zoom':
        tl.set(transition, { toScale: 0.5 })
          .to(transition, {
            duration: transitionConfig.duration,
            ease: transitionConfig.easing,
            progress: 1,
            fromScale: 1.5,
            toScale: 1,
            fromOpacity: 0,
            toOpacity: 1,
            onUpdate: () => {
              fromLayer.getRoot().scale.setScalar(transition.fromScale);
              toLayer.getRoot().scale.setScalar(transition.toScale);
              fromLayer.setOpacity(transition.fromOpacity);
              toLayer.setOpacity(transition.toOpacity);
            }
          });
        break;

      case 'custom':
        // Custom transition implementation
        break;
    }

    // Store active transition
    this.activeTransitions.set(config.from, tl);
    this.activeTransitions.set(config.to, tl);

    // Wait for completion
    await tl.then();
  }

  /**
   * Cancel active transition for a layer
   */
  public cancelTransition(layerId: string): void {
    const transition = this.activeTransitions.get(layerId);
    if (transition) {
      transition.kill();
      this.activeTransitions.delete(layerId);
    }
  }

  /**
   * Blend layers together
   */
  public blend(config: LayerBlend): void {
    // Validate layers
    config.layers.forEach(layerId => {
      if (!this.layerManager.hasLayer(layerId)) {
        throw new Error(\`Invalid layer: \${layerId}\`);
      }
    });

    // Merge with default config
    const blendConfig: Required<LayerBlend> = {
      ...this.config.defaultBlend,
      ...config
    };

    // Setup blend based on mode
    switch (blendConfig.mode) {
      case 'add':
        this.blendAdd(blendConfig);
        break;
      case 'multiply':
        this.blendMultiply(blendConfig);
        break;
      case 'screen':
        this.blendScreen(blendConfig);
        break;
      case 'overlay':
        this.blendOverlay(blendConfig);
        break;
      case 'custom':
        this.blendCustom(blendConfig);
        break;
    }

    // Store active blend
    const id = blendConfig.layers.join('-');
    this.activeBlends.set(id, blendConfig);
    this.emit('blendCreated', blendConfig);
  }

  /**
   * Remove layer blend
   */
  public unblend(layers: string[]): void {
    const id = layers.join('-');
    const blend = this.activeBlends.get(id);
    if (blend) {
      // Reset layer properties
      blend.layers.forEach(layerId => {
        const layer = this.layerManager.getLayer(layerId);
        if (layer) {
          layer.setOpacity(1);
        }
      });

      this.activeBlends.delete(id);
      this.emit('blendRemoved', blend);
    }
  }

  /**
   * Create a layer group
   */
  public createGroup(config: LayerGroup): void {
    if (this.groups.size >= this.config.maxActiveGroups) {
      throw new Error('Maximum number of active groups reached');
    }

    // Validate layers
    config.layers.forEach(layerId => {
      if (!this.layerManager.hasLayer(layerId)) {
        throw new Error(\`Invalid layer: \${layerId}\`);
      }
    });

    // Store group
    this.groups.set(config.id, config);

    // Activate if needed
    if (config.active) {
      this.activateGroup(config.id);
    }

    this.emit('groupCreated', config);
  }

  /**
   * Remove a layer group
   */
  public removeGroup(id: string): void {
    const group = this.groups.get(id);
    if (group) {
      // Deactivate if active
      if (group.active) {
        this.deactivateGroup(id);
      }

      this.groups.delete(id);
      this.emit('groupRemoved', group);
    }
  }

  /**
   * Activate a layer group
   */
  public async activateGroup(id: string): Promise<void> {
    const group = this.groups.get(id);
    if (!group) {
      throw new Error(\`Invalid group: \${id}\`);
    }

    // Skip if already active
    if (group.active) {
      return;
    }

    // Activate layers with transition
    if (group.transition) {
      await Promise.all(group.layers.map(layerId => 
        this.transition({
          from: 'none',
          to: layerId,
          ...group.transition
        })
      ));
    } else {
      group.layers.forEach(layerId => {
        const layer = this.layerManager.getLayer(layerId);
        if (layer) {
          layer.activate();
        }
      });
    }

    // Apply blend if configured
    if (group.blend) {
      this.blend({
        layers: group.layers,
        ...group.blend
      });
    }

    group.active = true;
    this.emit('groupActivated', group);
  }

  /**
   * Deactivate a layer group
   */
  public async deactivateGroup(id: string): Promise<void> {
    const group = this.groups.get(id);
    if (!group) {
      throw new Error(\`Invalid group: \${id}\`);
    }

    // Skip if not active
    if (!group.active) {
      return;
    }

    // Remove blend if exists
    if (group.blend) {
      this.unblend(group.layers);
    }

    // Deactivate layers with transition
    if (group.transition) {
      await Promise.all(group.layers.map(layerId =>
        this.transition({
          from: layerId,
          to: 'none',
          ...group.transition
        })
      ));
    } else {
      group.layers.forEach(layerId => {
        const layer = this.layerManager.getLayer(layerId);
        if (layer) {
          layer.deactivate();
        }
      });
    }

    group.active = false;
    this.emit('groupDeactivated', group);
  }

  /**
   * Apply a layer preset
   */
  public async applyPreset(id: string): Promise<void> {
    const preset = this.presets.get(id);
    if (!preset) {
      throw new Error(\`Invalid preset: \${id}\`);
    }

    // Deactivate all groups
    await Promise.all(
      Array.from(this.groups.keys()).map(groupId => 
        this.deactivateGroup(groupId)
      )
    );

    // Configure layers
    await Promise.all(
      preset.layers.map(async layer => {
        const existingLayer = this.layerManager.getLayer(layer.id);
        if (existingLayer) {
          Object.assign(existingLayer.getConfig(), layer.config);
        } else {
          // Create layer if doesn't exist
          await this.layerManager.addLayer(layer.id, layer.config);
        }
      })
    );

    // Create and activate groups
    if (preset.groups) {
      preset.groups.forEach(group => {
        this.createGroup(group);
        if (group.active) {
          this.activateGroup(group.id);
        }
      });
    }

    this.emit('presetApplied', preset);
  }

  /**
   * Add blend modes
   */
  private blendAdd(config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendMultiply(config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendScreen(config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendOverlay(config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendCustom(config: Required<LayerBlend>): void {
    // Implementation
  }
}