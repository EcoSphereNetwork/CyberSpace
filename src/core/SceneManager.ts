import * as THREE from 'three';
import { ResourceManager } from './ResourceManager';
import { LoadingManager } from './LoadingManager';
import { EventEmitter } from '@/utils/EventEmitter';
import { EarthScene } from '@/scenes/EarthScene';
import { NetworkScene } from '@/scenes/NetworkScene';
import { TransitionManager } from './TransitionManager';

export type SceneType = 'earth' | 'network';

interface SceneConfig {
  type: SceneType;
  name: string;
  description: string;
  resources: Array<{
    url: string;
    type: 'texture' | 'model' | 'audio' | 'json';
  }>;
}

export class SceneManager extends EventEmitter {
  private static instance: SceneManager;
  private scenes: Map<SceneType, any>;
  private configs: Map<SceneType, SceneConfig>;
  private activeScene: SceneType | null;
  private container: HTMLElement | null;
  private resourceManager: ResourceManager;
  private loadingManager: LoadingManager;
  private transitionManager: TransitionManager;

  private constructor() {
    super();
    this.scenes = new Map();
    this.configs = new Map();
    this.activeScene = null;
    this.container = null;
    this.resourceManager = ResourceManager.getInstance();
    this.loadingManager = LoadingManager.getInstance();
    this.transitionManager = TransitionManager.getInstance();
    this.initializeConfigs();
  }

  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  private initializeConfigs(): void {
    // Define scene configurations
    const configs: Record<SceneType, SceneConfig> = {
      earth: {
        type: 'earth',
        name: 'Earth View',
        description: 'Global network visualization on Earth',
        resources: [
          { url: '/textures/earth.jpg', type: 'texture' },
          { url: '/textures/clouds.jpg', type: 'texture' },
          { url: '/textures/stars.jpg', type: 'texture' },
        ],
      },
      network: {
        type: 'network',
        name: 'Network View',
        description: 'Detailed network topology visualization',
        resources: [
          { url: '/models/node.glb', type: 'model' },
          { url: '/textures/node.jpg', type: 'texture' },
          { url: '/data/network.json', type: 'json' },
        ],
      },
    };

    // Store configurations
    for (const [type, config] of Object.entries(configs)) {
      this.configs.set(type as SceneType, config);
    }
  }

  initialize(container: HTMLElement): void {
    this.container = container;
    this.emit('initialized');
  }

  async loadScene(type: SceneType): Promise<void> {
    // Check if scene exists
    const config = this.configs.get(type);
    if (!config) {
      throw new Error(`Scene ${type} not found`);
    }

    // Load scene resources
    await this.resourceManager.preload(config.resources);

    // Create scene instance
    let scene;
    switch (type) {
      case 'earth':
        scene = new EarthScene(this.container!);
        break;
      case 'network':
        scene = new NetworkScene(this.container!);
        break;
      default:
        throw new Error(`Unknown scene type: ${type}`);
    }

    // Store scene
    this.scenes.set(type, scene);
    this.activeScene = type;
    this.emit('sceneLoaded', type);
  }

  async switchScene(type: SceneType): Promise<void> {
    if (!this.scenes.has(type)) {
      await this.loadScene(type);
      return;
    }

    // Hide current scene
    if (this.activeScene) {
      const currentScene = this.scenes.get(this.activeScene);
      if (currentScene) {
        await this.fadeOut(currentScene);
      }
    }

    // Show new scene
    const newScene = this.scenes.get(type);
    if (newScene) {
      await this.fadeIn(newScene);
      this.activeScene = type;
      this.emit('sceneChanged', type);
    }
  }

  private async fadeOut(scene: any): Promise<void> {
    return new Promise<void>((resolve) => {
      // Implement fade out animation
      setTimeout(resolve, 500);
    });
  }

  private async fadeIn(scene: any): Promise<void> {
    return new Promise<void>((resolve) => {
      // Implement fade in animation
      setTimeout(resolve, 500);
    });
  }

  getActiveScene(): any | null {
    if (!this.activeScene) return null;
    return this.scenes.get(this.activeScene) || null;
  }

  getScene(type: SceneType): any | undefined {
    return this.scenes.get(type);
  }

  dispose(): void {
    // Dispose all scenes
    for (const scene of this.scenes.values()) {
      if (scene && typeof scene.dispose === 'function') {
        scene.dispose();
      }
    }

    this.scenes.clear();
    this.activeScene = null;
    this.container = null;
  }
}
