import { EventEmitter } from '@/utils/EventEmitter';
import { LoadingManager } from './LoadingManager';
import * as THREE from 'three';
import type { GLTF as GLTFType } from 'three/examples/jsm/loaders/GLTFLoader';
import type { Object3D, Material } from 'three';

export type ResourceType = 'texture' | 'model' | 'audio' | 'json';

interface Resource {
  url: string;
  type: ResourceType;
  data?: any;
}

type GLTFResult = GLTFType & {
  nodes: { [key: string]: Object3D };
  materials: { [key: string]: Material };
};

export class ResourceManager extends EventEmitter {
  private static instance: ResourceManager;
  private resources: Map<string, Resource>;
  private loadingManager: LoadingManager;
  private textureLoader: THREE.TextureLoader;
  private audioLoader: THREE.AudioLoader;

  private constructor() {
    super();
    this.resources = new Map();
    this.loadingManager = LoadingManager.getInstance();

    // Initialize loaders
    const manager = new THREE.LoadingManager(
      // onLoad
      () => {
        this.emit('loaded');
      },
      // onProgress
      (url, loaded, total) => {
        const progress = (loaded / total) * 100;
        this.emit('progress', { url, loaded, total, progress });
      },
      // onError
      (url) => {
        this.emit('error', { url });
      }
    );

    this.textureLoader = new THREE.TextureLoader(manager);
    this.audioLoader = new THREE.AudioLoader(manager);
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  async preload(resources: Array<{ url: string; type: ResourceType }>): Promise<void> {
    const loadPromises = resources.map((resource) => this.load(resource.url, resource.type));
    await Promise.all(loadPromises);
  }

  async load(url: string, type: ResourceType): Promise<any> {
    // Check if already loaded
    const existingResource = this.resources.get(url);
    if (existingResource?.data) {
      return existingResource.data;
    }

    // Add to loading manager
    this.loadingManager.addItem(url);

    try {
      let data: any;

      switch (type) {
        case 'texture':
          data = await this.loadTexture(url);
          break;
        case 'model':
          // Models should be loaded using useGLTF hook in React components
          throw new Error('Models should be loaded using useGLTF hook in React components');
        case 'audio':
          data = await this.loadAudio(url);
          break;
        case 'json':
          data = await this.loadJSON(url);
          break;
        default:
          throw new Error(`Unknown resource type: ${type}`);
      }

      // Store resource
      this.resources.set(url, { url, type, data });

      // Complete loading item
      this.loadingManager.completeItem(url);

      return data;
    } catch (error) {
      console.error(`Failed to load resource ${url}:`, error);
      this.loadingManager.completeItem(url);
      throw error;
    }
  }

  private loadTexture(url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });
  }

  private loadAudio(url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        url,
        (buffer) => resolve(buffer),
        undefined,
        (error) => reject(error)
      );
    });
  }

  private async loadJSON(url: string): Promise<any> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load JSON from ${url}: ${response.statusText}`);
    }
    return response.json();
  }

  getResource(url: string): Resource | undefined {
    return this.resources.get(url);
  }

  hasResource(url: string): boolean {
    return this.resources.has(url);
  }

  clearResource(url: string): void {
    const resource = this.resources.get(url);
    if (resource?.data) {
      switch (resource.type) {
        case 'texture':
          (resource.data as THREE.Texture).dispose();
          break;
      }
    }
    this.resources.delete(url);
  }

  clearAll(): void {
    for (const url of this.resources.keys()) {
      this.clearResource(url);
    }
  }

  dispose(): void {
    this.clearAll();
    this.resources.clear();
  }
}
