import { TextureLoader, CubeTextureLoader, ObjectLoader, AudioLoader, Texture, CubeTexture } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { LoadingManager } from './LoadingManager';

export type ResourceType = 'texture' | 'cubeTexture' | 'model' | 'audio' | 'json';

interface ResourceCache {
  resource: any;
  timestamp: number;
  type: ResourceType;
  expires?: number;
}

interface ResourceRequest {
  url: string;
  type: ResourceType;
  id: string;
}

interface ResourceResponse {
  id: string;
  url: string;
  type: string;
  status: 'success' | 'error';
  data?: ArrayBuffer;
  error?: string;
}

export class ResourceManager {
  private static instance: ResourceManager;
  private cache: Map<string, ResourceCache>;
  private loaders: Map<ResourceType, any>;
  private loadingManager: LoadingManager;
  private maxCacheAge: number = 5 * 60 * 1000; // 5 minutes
  private maxCacheSize: number = 100; // Maximum number of cached items
  private worker: Worker;
  private pendingRequests: Map<string, {
    resolve: (value: any) => void;
    reject: (reason?: any) => void;
  }>;

  private constructor() {
    this.cache = new Map();
    this.loaders = new Map();
    this.pendingRequests = new Map();
    this.loadingManager = LoadingManager.getInstance();
    this.initializeLoaders();
    this.initializeWorker();
    this.startCacheCleanup();
  }

  static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  private initializeLoaders(): void {
    // Initialize texture loader
    const textureLoader = new TextureLoader();
    this.loaders.set('texture', textureLoader);

    // Initialize cube texture loader
    const cubeTextureLoader = new CubeTextureLoader();
    this.loaders.set('cubeTexture', cubeTextureLoader);

    // Initialize GLTF loader with DRACO compression
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);
    this.loaders.set('model', gltfLoader);

    // Initialize audio loader
    const audioLoader = new AudioLoader();
    this.loaders.set('audio', audioLoader);

    // Initialize object loader for JSON
    const objectLoader = new ObjectLoader();
    this.loaders.set('json', objectLoader);
  }

  private initializeWorker(): void {
    this.worker = new Worker(
      new URL('../workers/resourceLoader.worker.ts', import.meta.url),
      { type: 'module' }
    );

    this.worker.onmessage = (event: MessageEvent<ResourceResponse>) => {
      const { id, status, data, error } = event.data;
      const request = this.pendingRequests.get(id);

      if (!request) {
        console.warn(`No pending request found for id: ${id}`);
        return;
      }

      if (status === 'success' && data) {
        this.processLoadedData(event.data).then(
          result => request.resolve(result),
          error => request.reject(error)
        );
      } else {
        request.reject(new Error(error || 'Unknown error'));
      }

      this.pendingRequests.delete(id);
    };
  }

  private async processLoadedData(response: ResourceResponse): Promise<any> {
    const { type, data } = response;
    const blob = new Blob([data!]);
    const url = URL.createObjectURL(blob);

    try {
      let result;
      switch (type) {
        case 'texture':
          result = await this.loadTexture(url);
          break;
        case 'cubeTexture':
          result = await this.loadCubeTexture(url);
          break;
        case 'model':
          result = await this.loadModel(url);
          break;
        case 'audio':
          result = await this.loadAudio(url);
          break;
        case 'json':
          result = await this.loadJson(url);
          break;
        default:
          throw new Error(`Unknown resource type: ${type}`);
      }

      return result;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private loadTexture(url: string): Promise<Texture> {
    return new Promise((resolve, reject) => {
      this.loaders.get('texture').load(url, resolve, undefined, reject);
    });
  }

  private loadCubeTexture(url: string): Promise<CubeTexture> {
    return new Promise((resolve, reject) => {
      this.loaders.get('cubeTexture').load(url, resolve, undefined, reject);
    });
  }

  private loadModel(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loaders.get('model').load(url, resolve, undefined, reject);
    });
  }

  private loadAudio(url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.loaders.get('audio').load(url, resolve, undefined, reject);
    });
  }

  private loadJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.loaders.get('json').load(url, resolve, undefined, reject);
    });
  }

  async load(url: string, type: ResourceType, options: {
    expires?: number;
    forceReload?: boolean;
    progressCallback?: (progress: number) => void;
  } = {}): Promise<any> {
    const { expires, forceReload = false } = options;

    // Check cache first
    if (!forceReload) {
      const cached = this.cache.get(url);
      if (cached && (!cached.expires || cached.expires > Date.now())) {
        return cached.resource;
      }
    }

    // Add to loading manager
    const loadingId = `${type}_${url}`;
    this.loadingManager.addItem(loadingId);
    this.loadingManager.setCurrentItem(`Loading ${type}: ${url}`);

    try {
      // Create request ID
      const requestId = `${Date.now()}_${Math.random()}`;

      // Create promise for this request
      const promise = new Promise((resolve, reject) => {
        this.pendingRequests.set(requestId, { resolve, reject });
      });

      // Send request to worker
      const request: ResourceRequest = { url, type, id: requestId };
      this.worker.postMessage(request);

      // Wait for response
      const resource = await promise;

      // Cache the resource
      this.cache.set(url, {
        resource,
        timestamp: Date.now(),
        type,
        expires: expires ? Date.now() + expires : undefined,
      });

      // Clean cache if it's too large
      if (this.cache.size > this.maxCacheSize) {
        this.cleanCache();
      }

      // Mark as complete in loading manager
      this.loadingManager.completeItem(loadingId);

      return resource;
    } catch (error) {
      this.loadingManager.completeItem(loadingId);
      throw error;
    }
  }

  private startCacheCleanup(): void {
    setInterval(() => {
      this.cleanCache();
    }, 60000); // Clean every minute
  }

  private cleanCache(): void {
    const now = Date.now();

    // Remove expired items
    for (const [url, cached] of this.cache.entries()) {
      if (
        cached.expires && cached.expires <= now ||
        cached.timestamp + this.maxCacheAge <= now
      ) {
        this.cache.delete(url);
      }
    }

    // If still too many items, remove oldest
    if (this.cache.size > this.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
      toRemove.forEach(([url]) => this.cache.delete(url));
    }
  }

  preload(urls: { url: string; type: ResourceType }[]): Promise<void[]> {
    return Promise.all(
      urls.map(({ url, type }) =>
        this.load(url, type).catch(error => {
          console.error(`Failed to preload ${url}:`, error);
        })
      )
    );
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  getCacheStats(): {
    size: number;
    types: Record<ResourceType, number>;
    totalAge: number;
  } {
    const stats = {
      size: this.cache.size,
      types: {
        texture: 0,
        cubeTexture: 0,
        model: 0,
        audio: 0,
        json: 0,
      },
      totalAge: 0,
    };

    const now = Date.now();
    for (const cached of this.cache.values()) {
      stats.types[cached.type]++;
      stats.totalAge += now - cached.timestamp;
    }

    return stats;
  }

  dispose(): void {
    this.worker.terminate();
    this.clearCache();
    this.pendingRequests.clear();
  }
}
