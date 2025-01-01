import { Layer, LayerConfig } from "@/core/layers/Layer";
import { Scene, WebGLRenderer, Camera } from "three";

interface NetworkLayerConfig extends LayerConfig {
  nodes?: {
    size?: number;
    colors?: {
      default?: number;
      selected?: number;
      error?: number;
    };
  };
  links?: {
    width?: number;
    colors?: {
      default?: number;
      selected?: number;
      error?: number;
    };
  };
}

export class NetworkLayer extends Layer {
  private readonly scene: Scene;
  private readonly renderer: WebGLRenderer;
  private readonly camera: Camera;
  private readonly config: Required<NetworkLayerConfig>;

  constructor(config: NetworkLayerConfig) {
    super(config);
    this.scene = new Scene();
    this.renderer = new WebGLRenderer();
    this.camera = new Camera();
    this.config = {
      ...config,
      nodes: {
        size: config.nodes?.size ?? 1,
        colors: {
          default: config.nodes?.colors?.default ?? 0x1976d2,
          selected: config.nodes?.colors?.selected ?? 0x2196f3,
          error: config.nodes?.colors?.error ?? 0xf44336,
        },
      },
      links: {
        width: config.links?.width ?? 1,
        colors: {
          default: config.links?.colors?.default ?? 0x757575,
          selected: config.links?.colors?.selected ?? 0x9e9e9e,
          error: config.links?.colors?.error ?? 0xf44336,
        },
      },
    } as Required<NetworkLayerConfig>;
  }

  public async initialize(): Promise<void> {
    await super.initialize();
    this.scene.add(this.root);
  }

  public async dispose(): Promise<void> {
    await super.dispose();
    this.scene.remove(this.root);
  }

  public async update(deltaTime: number): Promise<void> {
    await super.update(deltaTime);
    // Update animations, physics, etc.
  }

  public async render(): Promise<void> {
    await super.render();
    this.renderer.render(this.scene, this.camera);
  }

  public getScene(): Scene {
    return this.scene;
  }

  public getRenderer(): WebGLRenderer {
    return this.renderer;
  }

  public getCamera(): Camera {
    return this.camera;
  }

  public getConfig(): Required<NetworkLayerConfig> {
    return this.config;
  }
}
