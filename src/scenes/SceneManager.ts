import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { ResourceManager } from '@/core/ResourceManager';

export class SceneManager {
  private static instance: SceneManager;
  private scenes: Map<string, THREE.Scene>;
  private activeScene: string | null;
  private resourceManager: ResourceManager;

  private constructor() {
    this.scenes = new Map();
    this.activeScene = null;
    this.resourceManager = ResourceManager.getInstance();
  }

  static getInstance(): SceneManager {
    if (!SceneManager.instance) {
      SceneManager.instance = new SceneManager();
    }
    return SceneManager.instance;
  }

  addScene(name: string, scene: THREE.Scene): void {
    this.scenes.set(name, scene);
  }

  removeScene(name: string): void {
    this.scenes.delete(name);
    if (this.activeScene === name) {
      this.activeScene = null;
    }
  }

  setActiveScene(name: string): void {
    if (!this.scenes.has(name)) {
      throw new Error(`Scene "${name}" not found`);
    }
    this.activeScene = name;
  }

  getActiveScene(): THREE.Scene | null {
    if (!this.activeScene) {
      return null;
    }
    return this.scenes.get(this.activeScene) || null;
  }

  dispose(): void {
    this.scenes.forEach((scene) => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
    });
    this.scenes.clear();
    this.activeScene = null;
  }
}
