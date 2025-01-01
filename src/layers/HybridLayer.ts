import * as THREE from 'three';
import { Layer } from '@/core/Layer';
import { EventEmitter } from '@/utils/EventEmitter';

interface HybridConfig {
  mode?: 'blend' | 'overlay' | 'transition';
  layers?: Layer[];
  blendFactor?: number;
  transitionDuration?: number;
  transitionEasing?: (t: number) => number;
}

export class HybridLayer extends Layer {
  private config: Required<HybridConfig>;
  private layers: Layer[] = [];
  private transitionProgress: number = 0;
  private transitionStartTime: number = 0;
  private isTransitioning: boolean = false;
  private fromLayer: number = 0;
  private toLayer: number = 0;

  constructor(scene: THREE.Scene, config: HybridConfig = {}) {
    super(scene);

    this.config = {
      mode: config.mode ?? 'blend',
      layers: config.layers ?? [],
      blendFactor: config.blendFactor ?? 0.5,
      transitionDuration: config.transitionDuration ?? 1,
      transitionEasing: config.transitionEasing ?? this.easeInOutCubic,
    };

    this.layers = this.config.layers;
    this.setupLayers();
  }

  private setupLayers(): void {
    this.layers.forEach((layer) => {
      this.container.add(layer.getContainer());
    });
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  public setMode(mode: 'blend' | 'overlay' | 'transition'): void {
    this.config.mode = mode;
    this.updateLayerVisibility();
  }

  public setBlendFactor(factor: number): void {
    this.config.blendFactor = Math.max(0, Math.min(1, factor));
    this.updateLayerVisibility();
  }

  public addLayer(layer: Layer): void {
    this.layers.push(layer);
    this.container.add(layer.getContainer());
    this.updateLayerVisibility();
  }

  public removeLayer(layer: Layer): void {
    const index = this.layers.indexOf(layer);
    if (index !== -1) {
      this.layers.splice(index, 1);
      this.container.remove(layer.getContainer());
      this.updateLayerVisibility();
    }
  }

  public transition(fromIndex: number, toIndex: number): void {
    if (fromIndex < 0 || fromIndex >= this.layers.length ||
        toIndex < 0 || toIndex >= this.layers.length) {
      throw new Error('Invalid layer indices');
    }

    this.fromLayer = fromIndex;
    this.toLayer = toIndex;
    this.transitionProgress = 0;
    this.transitionStartTime = performance.now();
    this.isTransitioning = true;

    this.updateLayerVisibility();
  }

  private updateLayerVisibility(): void {
    switch (this.config.mode) {
      case 'blend':
        this.updateBlendMode();
        break;
      case 'overlay':
        this.updateOverlayMode();
        break;
      case 'transition':
        this.updateTransitionMode();
        break;
    }
  }

  private updateBlendMode(): void {
    this.layers.forEach((layer, index) => {
      const opacity = index === 0
        ? 1 - this.config.blendFactor
        : index === 1
          ? this.config.blendFactor
          : 0;

      layer.setOpacity(opacity);
      layer.setVisible(opacity > 0);
    });
  }

  private updateOverlayMode(): void {
    this.layers.forEach((layer, index) => {
      layer.setVisible(true);
      layer.setOpacity(1);
      layer.getContainer().renderOrder = index;
    });
  }

  private updateTransitionMode(): void {
    if (!this.isTransitioning) return;

    const elapsed = (performance.now() - this.transitionStartTime) / 1000;
    const progress = Math.min(elapsed / this.config.transitionDuration, 1);
    this.transitionProgress = this.config.transitionEasing(progress);

    this.layers.forEach((layer, index) => {
      if (index === this.fromLayer) {
        layer.setOpacity(1 - this.transitionProgress);
        layer.setVisible(true);
      } else if (index === this.toLayer) {
        layer.setOpacity(this.transitionProgress);
        layer.setVisible(true);
      } else {
        layer.setVisible(false);
      }
    });

    if (progress >= 1) {
      this.isTransitioning = false;
      this.layers.forEach((layer, index) => {
        layer.setVisible(index === this.toLayer);
        layer.setOpacity(1);
      });
    }
  }

  public update(deltaTime: number): void {
    // Update all layers
    this.layers.forEach((layer) => {
      layer.update(deltaTime);
    });

    // Update transition if needed
    if (this.isTransitioning) {
      this.updateTransitionMode();
    }
  }

  public dispose(): void {
    this.layers.forEach((layer) => {
      layer.dispose();
    });
    this.layers = [];
    super.dispose();
  }

  // Helper methods
  public getLayerCount(): number {
    return this.layers.length;
  }

  public getLayer(index: number): Layer | undefined {
    return this.layers[index];
  }

  public getCurrentMode(): string {
    return this.config.mode;
  }

  public isInTransition(): boolean {
    return this.isTransitioning;
  }

  public getTransitionProgress(): number {
    return this.transitionProgress;
  }

  public setTransitionDuration(duration: number): void {
    this.config.transitionDuration = duration;
  }

  public setTransitionEasing(easing: (t: number) => number): void {
    this.config.transitionEasing = easing;
  }

  // Built-in easing functions
  public static readonly Easing = {
    Linear: (t: number) => t,
    EaseInQuad: (t: number) => t * t,
    EaseOutQuad: (t: number) => t * (2 - t),
    EaseInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    EaseInCubic: (t: number) => t * t * t,
    EaseOutCubic: (t: number) => (--t) * t * t + 1,
    EaseInOutCubic: (t: number) => t < 0.5
      ? 4 * t * t * t
      : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
    EaseInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
    EaseOutExpo: (t: number) => t === 1 ? 1 : -Math.pow(2, -10 * t) + 1,
    EaseInOutExpo: (t: number) => {
      if (t === 0) return 0;
      if (t === 1) return 1;
      if ((t *= 2) < 1) return 0.5 * Math.pow(2, 10 * (t - 1));
      return 0.5 * (-Math.pow(2, -10 * --t) + 2);
    },
  };
}
