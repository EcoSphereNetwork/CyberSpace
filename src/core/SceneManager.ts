import { Scene, PerspectiveCamera, WebGLRenderer } from 'three';
import { ResourceManager } from './ResourceManager';
import { LoadingManager } from './LoadingManager';
import { EventEmitter } from '@/utils/EventEmitter';
import { EarthScene } from '@/scenes/EarthScene';
import { NetworkScene } from '@/scenes/NetworkScene';

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
  private activeScene: SceneType | null;
  private container: HTMLElement | null;
  private resourceManager: ResourceManager;
  private loadingManager: LoadingManager;

  private constructor() {
    super();
    this.scenes = new Map();
    this.activeScene = null;
    this.container = null;
    this.resourceManager = ResourceManager.getInstance();
    this.loadingManager = LoadingManager.getInstance();
  }

  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  initialize(container: HTMLElement): void {
    this.container = container;
    this.initializeScenes();
  }

  private initializeScenes(): void {
    // Define scene configurations
    const sceneConfigs: Record<SceneType, SceneConfig> = {
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

    // Initialize each scene
    for (const config of Object.values(sceneConfigs)) {
      this.loadingManager.addItem(`scene_${config.type}`);
      this.loadingManager.setCurrentItem(`Loading scene: ${config.name}`);

      // Preload scene resources
      this.resourceManager.preload(config.resources)
        .then(() => {
          // Create scene instance
          let scene;
          switch (config.type) {
            case 'earth':
              scene = new EarthScene(this.container!);
              break;
            case 'network':
              scene = new NetworkScene(this.container!);
              break;
          }

          // Store scene
          if (scene) {
            this.scenes.set(config.type, scene);
            this.loadingManager.completeItem(`scene_${config.type}`);
            this.emit('sceneLoaded', config.type);
          }
        })
        .catch(error => {
          console.error(`Failed to load scene ${config.type}:`, error);
          this.loadingManager.completeItem(`scene_${config.type}`);
          this.emit('error', { type: 'sceneLoad', scene: config.type, error });
        });
    }
  }

  async switchScene(type: SceneType): Promise<void> {
    if (!this.scenes.has(type)) {
      throw new Error(`Scene ${type} not found`);
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

  getActiveScene(): SceneType | null {
    return this.activeScene;
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