import { Object3D } from "three";

export class Layer {
  protected id: string;
  protected name: string;
  protected visible: boolean;
  protected enabled: boolean;
  protected opacity: number;
  protected root: Object3D;

  constructor(config: LayerConfig = {}) {
    this.id = config.id || Math.random().toString(36).substring(7);
    this.name = config.name || this.id;
    this.visible = config.visible ?? true;
    this.enabled = config.enabled ?? true;
    this.opacity = config.opacity ?? 1;
    this.root = new Object3D();
  }

  public async initialize(): Promise<void> {
    // Default implementation
  }

  public async dispose(): Promise<void> {
    // Default implementation
  }

  public async update(_deltaTime: number): Promise<void> {
    // Default implementation
  }

  public async render(): Promise<void> {
    // Default implementation
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public isVisible(): boolean {
    return this.visible;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public getRoot(): Object3D {
    return this.root;
  }

  public setVisible(visible: boolean): void {
    this.visible = visible;
    this.root.visible = visible;
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
  }

  public activate(): void {
    this.enabled = true;
    this.visible = true;
  }

  public deactivate(): void {
    this.enabled = false;
    this.visible = false;
  }

  public getConfig(): LayerConfig {
    return {
      id: this.id,
      name: this.name,
      visible: this.visible,
      enabled: this.enabled,
      opacity: this.opacity,
    };
  }
}

export interface LayerConfig {
  id?: string;
  name?: string;
  visible?: boolean;
  enabled?: boolean;
  opacity?: number;
}
