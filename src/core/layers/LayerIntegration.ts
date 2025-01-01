import { Layer } from "./Layer";
import { Vector3 } from "three";
import { gsap } from "gsap";
import { LayerManager } from "./LayerManager";

interface LayerTransition {
  from: string;
  to: string;
  duration?: number;
  easing?: string;
  type?: "fade" | "zoom" | "slide" | "custom";
  direction?: "up" | "down" | "left" | "right";
  fromOpacity?: number;
  toOpacity?: number;
  fromScale?: number;
  toScale?: number;
  fromPosition?: Vector3;
  toPosition?: Vector3;
  onStart?: () => void;
  onComplete?: () => void;
  metadata?: Record<string, any>;
}

interface LayerBlend {
  layers: string[];
  mode: "add" | "overlay" | "multiply" | "screen" | "custom";
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
  name?: string;
  layers: string[];
  blend?: LayerBlend;
  metadata?: Record<string, any>;
}

export class LayerIntegration {
  private readonly layerManager: LayerManager;
  private readonly groups: Map<string, LayerGroup>;

  constructor(layerManager: LayerManager) {
    this.layerManager = layerManager;
    this.groups = new Map();
  }

  public async transition(config: LayerTransition): Promise<void> {
    const transitionConfig: Required<LayerTransition> = {
      duration: 1000,
      easing: "power2.inOut",
      type: "fade",
      direction: "right",
      fromOpacity: 1,
      toOpacity: 1,
      fromScale: 1,
      toScale: 1,
      fromPosition: new Vector3(),
      toPosition: new Vector3(),
      onStart: () => {},
      onComplete: () => {},
      metadata: {},
      ...config,
    };

    const fromLayer = this.layerManager.getLayer(transitionConfig.from);
    const toLayer = this.layerManager.getLayer(transitionConfig.to);

    if (!fromLayer || !toLayer) {
      throw new Error("Invalid layer IDs");
    }

    switch (transitionConfig.type) {
      case "fade":
        await this.transitionFade(fromLayer, toLayer, transitionConfig);
        break;
      case "zoom":
        await this.transitionZoom(fromLayer, toLayer, transitionConfig);
        break;
      case "slide":
        await this.transitionSlide(fromLayer, toLayer, transitionConfig);
        break;
      case "custom":
        await this.transitionCustom(fromLayer, toLayer, transitionConfig);
        break;
      default:
        throw new Error(`Invalid transition type: ${transitionConfig.type}`);
    }
  }

  private async transitionFade(
    fromLayer: Layer,
    toLayer: Layer,
    transition: Required<LayerTransition>
  ): Promise<void> {
    transition.onStart();

    await new Promise<void>((resolve) => {
      gsap.to(fromLayer, {
        opacity: transition.fromOpacity,
        duration: transition.duration / 1000,
        ease: transition.easing,
        onComplete: () => {
          fromLayer.setOpacity(transition.fromOpacity);
          toLayer.setOpacity(transition.toOpacity);
          resolve();
        },
      });
    });

    transition.onComplete();
  }

  private async transitionZoom(
    fromLayer: Layer,
    toLayer: Layer,
    transition: Required<LayerTransition>
  ): Promise<void> {
    transition.onStart();

    await new Promise<void>((resolve) => {
      gsap.to(fromLayer.getRoot().scale, {
        x: transition.fromScale,
        y: transition.fromScale,
        z: transition.fromScale,
        duration: transition.duration / 1000,
        ease: transition.easing,
        onComplete: () => {
          fromLayer.getRoot().scale.setScalar(transition.fromScale);
          toLayer.getRoot().scale.setScalar(transition.toScale);
          resolve();
        },
      });
    });

    transition.onComplete();
  }

  private async transitionSlide(
    fromLayer: Layer,
    toLayer: Layer,
    transition: Required<LayerTransition>
  ): Promise<void> {
    transition.onStart();

    await new Promise<void>((resolve) => {
      gsap.to(fromLayer.getRoot().position, {
        x: transition.fromPosition.x,
        y: transition.fromPosition.y,
        z: transition.fromPosition.z,
        duration: transition.duration / 1000,
        ease: transition.easing,
        onComplete: () => {
          fromLayer.getRoot().position.copy(transition.fromPosition);
          toLayer.getRoot().position.copy(transition.toPosition);
          resolve();
        },
      });
    });

    transition.onComplete();
  }

  private async transitionCustom(
    fromLayer: Layer,
    toLayer: Layer,
    transition: Required<LayerTransition>
  ): Promise<void> {
    transition.onStart();

    await new Promise<void>((resolve) => {
      gsap.to(fromLayer.getRoot(), {
        ...transition.metadata,
        duration: transition.duration / 1000,
        ease: transition.easing,
        onComplete: () => {
          toLayer.setOpacity(transition.toOpacity);
          resolve();
        },
      });
    });

    transition.onComplete();
  }

  public async blend(config: LayerBlend): Promise<void> {
    const { layers, mode } = config;

    for (const layerId of layers) {
      if (!this.layerManager.hasLayer(layerId)) {
        throw new Error(`Layer with id "${layerId}" not found`);
      }
    }

    const blendConfig: Required<LayerBlend> = {
      layers,
      mode,
      opacity: config.opacity ?? 1,
      mask: {
        texture: config.mask?.texture,
        color: config.mask?.color ?? 0xffffff,
        invert: config.mask?.invert ?? false,
      },
      metadata: config.metadata ?? {},
    };

    switch (blendConfig.mode) {
      case "add":
        this.blendAdd(blendConfig);
        break;
      case "multiply":
        this.blendMultiply(blendConfig);
        break;
      case "screen":
        this.blendScreen(blendConfig);
        break;
      case "overlay":
        this.blendOverlay(blendConfig);
        break;
      case "custom":
        this.blendCustom(blendConfig);
        break;
      default:
        throw new Error(`Invalid blend mode: ${blendConfig.mode}`);
    }
  }

  public async unblend(layerId: string): Promise<void> {
    const layer = this.layerManager.getLayer(layerId);
    if (!layer) {
      throw new Error(`Layer with id "${layerId}" not found`);
    }

    layer.setOpacity(1);
  }

  public async createGroup(config: LayerGroup): Promise<void> {
    const { id, layers } = config;

    if (this.groups.has(id)) {
      throw new Error(`Group with id "${id}" already exists`);
    }

    for (const layerId of layers) {
      if (!this.layerManager.hasLayer(layerId)) {
        throw new Error(`Layer with id "${layerId}" not found`);
      }
    }

    this.groups.set(id, config);
  }

  public async activateGroup(groupId: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group with id "${groupId}" not found`);
    }

    for (const layerId of group.layers) {
      const layer = this.layerManager.getLayer(layerId);
      if (layer) {
        layer.activate();
      }
    }

    if (group.blend) {
      this.blend(group.blend);
    }
  }

  public async deactivateGroup(groupId: string): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group with id "${groupId}" not found`);
    }

    for (const layerId of group.layers) {
      const layer = this.layerManager.getLayer(layerId);
      if (layer) {
        layer.deactivate();
      }
    }
  }

  public async updateGroup(groupId: string, config: Partial<LayerGroup>): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group with id "${groupId}" not found`);
    }

    Object.assign(group, config);
  }

  public async removeGroup(groupId: string): Promise<void> {
    if (!this.groups.has(groupId)) {
      throw new Error(`Group with id "${groupId}" not found`);
    }

    this.groups.delete(groupId);
  }

  private blendAdd(_config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendMultiply(_config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendScreen(_config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendOverlay(_config: Required<LayerBlend>): void {
    // Implementation
  }

  private blendCustom(_config: Required<LayerBlend>): void {
    // Implementation
  }
}
