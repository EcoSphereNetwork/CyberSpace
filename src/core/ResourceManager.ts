import { EventEmitter } from '@/utils/EventEmitter';
import { Object3D, Texture, Material, BufferGeometry } from 'three';

export interface Resource {
  id: string;
  type: 'model' | 'texture' | 'material' | 'geometry' | 'audio' | 'data';
  data: any;
  metadata?: Record<string, any>;
}

export class ResourceManager extends EventEmitter {
  private resources: Map<string, Resource>;
  private loadingPromises: Map<string, Promise<Resource>>;

  constructor() {
    super();
    this.resources = new Map();
    this.loadingPromises = new Map();
  }

  async loadResource(id: string, url: string, type: Resource['type']): Promise<Resource> {
    if (this.resources.has(id)) {
      return this.resources.get(id)!;
    }

    if (this.loadingPromises.has(id)) {
      return this.loadingPromises.get(id)!;
    }

    const loadPromise = this.loadResourceData(url, type).then((data) => {
      const resource: Resource = { id, type, data };
      this.resources.set(id, resource);
      this.loadingPromises.delete(id);
      this.emit('resourceLoaded', resource);
      return resource;
    });

    this.loadingPromises.set(id, loadPromise);
    return loadPromise;
  }

  private async loadResourceData(url: string, type: Resource['type']): Promise<any> {
    switch (type) {
      case 'model':
        return this.loadModel(url);
      case 'texture':
        return this.loadTexture(url);
      case 'material':
        return this.loadMaterial(url);
      case 'geometry':
        return this.loadGeometry(url);
      case 'audio':
        return this.loadAudio(url);
      case 'data':
        return this.loadData(url);
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }

  private async loadModel(url: string): Promise<Object3D> {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader');
    const loader = new GLTFLoader();
    const gltf = await new Promise<Object3D>((resolve, reject) => {
      loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
    });
    return gltf;
  }

  private async loadTexture(url: string): Promise<Texture> {
    const { TextureLoader } = await import('three');
    const loader = new TextureLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  private async loadMaterial(url: string): Promise<Material> {
    const data = await fetch(url).then((res) => res.json());
    const { MeshStandardMaterial } = await import('three');
    return new MeshStandardMaterial(data);
  }

  private async loadGeometry(url: string): Promise<BufferGeometry> {
    const { BufferGeometryLoader } = await import('three');
    const loader = new BufferGeometryLoader();
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  private async loadAudio(url: string): Promise<AudioBuffer> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    return audioContext.decodeAudioData(arrayBuffer);
  }

  private async loadData(url: string): Promise<any> {
    const response = await fetch(url);
    return response.json();
  }

  getResource(id: string): Resource | undefined {
    return this.resources.get(id);
  }

  hasResource(id: string): boolean {
    return this.resources.has(id);
  }

  removeResource(id: string): boolean {
    const resource = this.resources.get(id);
    if (resource) {
      this.disposeResource(resource);
      this.resources.delete(id);
      this.emit('resourceRemoved', resource);
      return true;
    }
    return false;
  }

  private disposeResource(resource: Resource): void {
    switch (resource.type) {
      case 'model':
        (resource.data as Object3D).traverse((obj) => {
          if (obj instanceof Object3D) {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach((mat) => mat.dispose());
              } else {
                obj.material.dispose();
              }
            }
          }
        });
        break;
      case 'texture':
        (resource.data as Texture).dispose();
        break;
      case 'material':
        (resource.data as Material).dispose();
        break;
      case 'geometry':
        (resource.data as BufferGeometry).dispose();
        break;
      case 'audio':
        // AudioBuffer doesn't need disposal
        break;
      case 'data':
        // JSON data doesn't need disposal
        break;
    }
  }

  clear(): void {
    this.resources.forEach((resource) => this.disposeResource(resource));
    this.resources.clear();
    this.loadingPromises.clear();
    this.emit('cleared');
  }
}