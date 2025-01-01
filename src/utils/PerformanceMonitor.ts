import { EventEmitter } from './EventEmitter';

export interface PerformanceConfig {
  monitoring?: boolean;
  targetFPS?: number;
  autoOptimize?: boolean;
  sampleSize?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  memory: {
    used: number;
    total: number;
    limit: number;
  };
  cpu: number;
  gpu: number;
}

export class PerformanceMonitor extends EventEmitter {
  private config: Required<PerformanceConfig>;
  private metrics: PerformanceMetrics;
  private frames: number[];
  private lastTime: number;
  private rafId: number | null;
  private active: boolean;

  constructor(config: PerformanceConfig = {}) {
    super();

    this.config = {
      monitoring: config.monitoring ?? true,
      targetFPS: config.targetFPS ?? 60,
      autoOptimize: config.autoOptimize ?? true,
      sampleSize: config.sampleSize ?? 60,
      warningThreshold: config.warningThreshold ?? 45,
      criticalThreshold: config.criticalThreshold ?? 30,
    };

    this.metrics = {
      fps: 0,
      frameTime: 0,
      memory: {
        used: 0,
        total: 0,
        limit: 0,
      },
      cpu: 0,
      gpu: 0,
    };

    this.frames = [];
    this.lastTime = performance.now();
    this.rafId = null;
    this.active = false;

    // Bind methods
    this.update = this.update.bind(this);
  }

  start(): void {
    if (this.active) {
      return;
    }

    this.active = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.update);
    this.emit('started');
  }

  stop(): void {
    if (!this.active) {
      return;
    }

    this.active = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.emit('stopped');
  }

  private update(): void {
    if (!this.active) {
      return;
    }

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Calculate FPS
    const fps = 1000 / deltaTime;
    this.frames.push(fps);
    if (this.frames.length > this.config.sampleSize) {
      this.frames.shift();
    }

    // Update metrics
    this.metrics.fps = this.frames.reduce((a, b) => a + b) / this.frames.length;
    this.metrics.frameTime = deltaTime;

    // Update memory metrics if available
    if (performance.memory) {
      this.metrics.memory = {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }

    // Check performance thresholds
    if (this.config.autoOptimize) {
      if (this.metrics.fps < this.config.criticalThreshold) {
        this.emit('critical', this.metrics);
        this.optimizePerformance('critical');
      } else if (this.metrics.fps < this.config.warningThreshold) {
        this.emit('warning', this.metrics);
        this.optimizePerformance('warning');
      }
    }

    // Emit metrics update
    this.emit('update', this.metrics);

    // Schedule next update
    this.rafId = requestAnimationFrame(this.update);
  }

  private optimizePerformance(level: 'warning' | 'critical'): void {
    // Implement performance optimization strategies
    const optimizations = {
      warning: {
        shadows: false,
        antialiasing: false,
        particles: 0.5,
      },
      critical: {
        shadows: false,
        antialiasing: false,
        particles: 0.25,
        resolution: 0.75,
      },
    };

    this.emit('optimize', { level, settings: optimizations[level] });
  }

  getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.metrics };
  }

  setMode(mode: 'quality' | 'balanced' | 'performance'): void {
    const settings = {
      quality: {
        targetFPS: 60,
        warningThreshold: 45,
        criticalThreshold: 30,
      },
      balanced: {
        targetFPS: 45,
        warningThreshold: 30,
        criticalThreshold: 20,
      },
      performance: {
        targetFPS: 30,
        warningThreshold: 20,
        criticalThreshold: 15,
      },
    };

    Object.assign(this.config, settings[mode]);
    this.emit('modeChanged', mode);
  }

  isActive(): boolean {
    return this.active;
  }

  getConfig(): Readonly<PerformanceConfig> {
    return { ...this.config };
  }

  setConfig(config: Partial<PerformanceConfig>): void {
    Object.assign(this.config, config);
    this.emit('configChanged', this.config);
  }
}