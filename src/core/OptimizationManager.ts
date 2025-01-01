import { EventEmitter } from '@/utils/EventEmitter';
import { WebGLRenderer, Scene, Camera, WebGLRenderTarget, Clock } from 'three';

interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  points: number;
  lines: number;
  memoryUsage: number;
  gpuMemoryUsage: number;
}

interface OptimizationSettings {
  targetFPS: number;
  minQuality: number;
  maxQuality: number;
  adaptiveQuality: boolean;
  frustumCulling: boolean;
  occlusionCulling: boolean;
  levelOfDetail: boolean;
  instancedRendering: boolean;
  textureCompression: boolean;
  geometryCompression: boolean;
  shaderOptimization: boolean;
  batchRendering: boolean;
}

export class OptimizationManager extends EventEmitter {
  private static instance: OptimizationManager;
  private renderer: WebGLRenderer | null;
  private settings: OptimizationSettings;
  private metrics: PerformanceMetrics;
  private clock: Clock;
  private frameCount: number;
  private lastTime: number;
  private renderTargets: Map<string, WebGLRenderTarget>;
  private isEnabled: boolean;

  private constructor() {
    super();
    this.renderer = null;
    this.settings = {
      targetFPS: 60,
      minQuality: 0.5,
      maxQuality: 1.0,
      adaptiveQuality: true,
      frustumCulling: true,
      occlusionCulling: true,
      levelOfDetail: true,
      instancedRendering: true,
      textureCompression: true,
      geometryCompression: true,
      shaderOptimization: true,
      batchRendering: true,
    };
    this.metrics = {
      fps: 0,
      frameTime: 0,
      drawCalls: 0,
      triangles: 0,
      points: 0,
      lines: 0,
      memoryUsage: 0,
      gpuMemoryUsage: 0,
    };
    this.clock = new Clock();
    this.frameCount = 0;
    this.lastTime = 0;
    this.renderTargets = new Map();
    this.isEnabled = true;
  }

  static getInstance(): OptimizationManager {
    if (!OptimizationManager.instance) {
      OptimizationManager.instance = new OptimizationManager();
    }
    return OptimizationManager.instance;
  }

  initialize(renderer: WebGLRenderer): void {
    this.renderer = renderer;
    this.clock.start();
    this.lastTime = this.clock.getElapsedTime();
  }

  updateMetrics(): void {
    if (!this.renderer) return;

    const currentTime = this.clock.getElapsedTime();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1) {
      // Update FPS
      this.metrics.fps = this.frameCount / deltaTime;
      this.metrics.frameTime = (deltaTime * 1000) / this.frameCount;

      // Update renderer stats
      const info = this.renderer.info;
      this.metrics.drawCalls = info.render.calls;
      this.metrics.triangles = info.render.triangles;
      this.metrics.points = info.render.points;
      this.metrics.lines = info.render.lines;

      // Update memory usage
      this.metrics.memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
      this.metrics.gpuMemoryUsage = info.memory.geometries + info.memory.textures;

      // Reset counters
      this.frameCount = 0;
      this.lastTime = currentTime;

      // Emit metrics update
      this.emit('metricsUpdated', this.metrics);

      // Adjust quality if needed
      if (this.settings.adaptiveQuality) {
        this.adjustQuality();
      }
    }

    this.frameCount++;
  }

  private adjustQuality(): void {
    if (!this.renderer) return;

    const targetFrameTime = 1000 / this.settings.targetFPS;
    const currentQuality = this.renderer.getPixelRatio();
    let newQuality = currentQuality;

    if (this.metrics.frameTime > targetFrameTime * 1.2) {
      // Performance is poor, reduce quality
      newQuality = Math.max(
        this.settings.minQuality,
        currentQuality - 0.1
      );
    } else if (
      this.metrics.frameTime < targetFrameTime * 0.8 &&
      currentQuality < this.settings.maxQuality
    ) {
      // Performance is good, increase quality
      newQuality = Math.min(
        this.settings.maxQuality,
        currentQuality + 0.1
      );
    }

    if (newQuality !== currentQuality) {
      this.renderer.setPixelRatio(newQuality);
      this.emit('qualityChanged', newQuality);
    }
  }

  updateSettings(settings: Partial<OptimizationSettings>): void {
    this.settings = {
      ...this.settings,
      ...settings,
    };
    this.emit('settingsUpdated', this.settings);
  }

  getSettings(): OptimizationSettings {
    return { ...this.settings };
  }

  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  optimizeScene(scene: Scene): void {
    if (!this.isEnabled) return;

    // Apply optimizations based on settings
    scene.traverse((object) => {
      // Frustum culling
      object.frustumCulled = this.settings.frustumCulling;

      // Level of detail
      if (this.settings.levelOfDetail && 'levels' in object) {
        // TODO: Implement LOD switching based on distance
      }

      // Instanced rendering
      if (this.settings.instancedRendering && 'isInstancedMesh' in object) {
        // TODO: Convert compatible meshes to instanced meshes
      }

      // Material optimizations
      if ('material' in object) {
        const material = Array.isArray(object.material)
          ? object.material
          : [object.material];

        material.forEach((mat) => {
          if (!mat) return;

          // Texture compression
          if (this.settings.textureCompression && mat.map) {
            // TODO: Implement texture compression
          }

          // Shader optimization
          if (this.settings.shaderOptimization) {
            mat.precision = 'lowp';
            mat.fog = false;
          }
        });
      }

      // Geometry optimizations
      if ('geometry' in object && object.geometry) {
        if (this.settings.geometryCompression) {
          object.geometry.computeBoundingBox();
          object.geometry.computeBoundingSphere();
        }
      }
    });

    // Batch rendering
    if (this.settings.batchRendering) {
      // TODO: Implement geometry batching
    }

    this.emit('sceneOptimized', scene);
  }

  createRenderTarget(
    id: string,
    width: number,
    height: number,
    options: { msaa?: boolean; hdr?: boolean } = {}
  ): WebGLRenderTarget {
    if (!this.renderer) {
      throw new Error('Renderer not initialized');
    }

    const { msaa = false, hdr = false } = options;

    const target = new WebGLRenderTarget(width, height, {
      samples: msaa ? 4 : 0,
      type: hdr ? THREE.HalfFloatType : THREE.UnsignedByteType,
    });

    this.renderTargets.set(id, target);
    return target;
  }

  getRenderTarget(id: string): WebGLRenderTarget | undefined {
    return this.renderTargets.get(id);
  }

  enable(): void {
    this.isEnabled = true;
    this.emit('enabled');
  }

  disable(): void {
    this.isEnabled = false;
    this.emit('disabled');
  }

  isOptimizationEnabled(): boolean {
    return this.isEnabled;
  }

  dispose(): void {
    // Dispose render targets
    for (const target of this.renderTargets.values()) {
      target.dispose();
    }
    this.renderTargets.clear();

    // Reset state
    this.renderer = null;
    this.clock.stop();
    this.frameCount = 0;
    this.lastTime = 0;
    this.isEnabled = true;
  }
}