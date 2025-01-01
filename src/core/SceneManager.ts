import { Scene } from "three";
import { EventEmitter } from "@/utils/EventEmitter";

export interface SceneManagerConfig {
  container: HTMLElement;
  autoStart?: boolean;
}

export class SceneManager {
  private readonly scenes: Map<string, Scene>;
  private readonly events: EventEmitter;
  private readonly container: HTMLElement;
  private readonly autoStart: boolean;

  constructor(config: SceneManagerConfig) {
    this.scenes = new Map();
    this.events = new EventEmitter();
    this.container = config.container;
    this.autoStart = config.autoStart ?? true;
  }

  public async addScene(id: string, scene: Scene): Promise<void> {
    if (this.scenes.has(id)) {
      throw new Error(`Scene with id "${id}" already exists`);
    }

    this.scenes.set(id, scene);
    this.emit("sceneLoaded", scene);
  }

  public async removeScene(id: string): Promise<void> {
    const scene = this.scenes.get(id);
    if (!scene) {
      throw new Error(`Scene with id "${id}" not found`);
    }

    this.scenes.delete(id);
  }

  public getScene(id: string): Scene | undefined {
    return this.scenes.get(id);
  }

  public getScenes(): Scene[] {
    return Array.from(this.scenes.values());
  }

  public async dispose(): Promise<void> {
    this.scenes.clear();
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.events.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.events.off(event, listener);
  }

  public emit(event: string, ...args: any[]): void {
    this.events.emit(event, ...args);
  }

  public async transitionToScene(config: {
    from: string;
    to: string;
    duration?: number;
    easing?: string;
    type?: "fade" | "zoom" | "slide" | "custom";
    direction?: "up" | "down" | "left" | "right";
    metadata?: Record<string, any>;
  }): Promise<void> {
    const fromScene = this.getScene(config.from);
    const toScene = this.getScene(config.to);

    if (!fromScene || !toScene) {
      throw new Error("Invalid scene IDs");
    }

    this.emit("transitionStart", config);

    // Implementation

    this.emit("transitionComplete", config);
  }
}
