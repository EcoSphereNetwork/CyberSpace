import { Scene, WebGLRenderer, PerspectiveCamera, Clock, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LayerManager } from '@/core/layers/LayerManager';
import { LayerIntegration } from '@/core/layers/LayerIntegration';
import { LayerPresets } from '@/core/layers/LayerPresets';
import { EventEmitter } from '@/utils/EventEmitter';

interface SceneConfig {
  id: string;
  preset?: string;
  camera?: {
    position?: Vector3;
    target?: Vector3;
    fov?: number;
  };
  controls?: {
    enabled?: boolean;
    autoRotate?: boolean;
    enableDamping?: boolean;
  };
  onEnter?: () => void;
  onLeave?: () => void;
  metadata?: Record<string, any>;
}

interface SceneTransition {
  from: string;
  to: string;
  duration?: number;
  type?: 'fade' | 'slide' | 'zoom' | 'custom';
  onStart?: () => void;
  onComplete?: () => void;
}

interface SceneManagerConfig {
  container: HTMLElement;
  defaultScene?: string;
  scenes?: SceneConfig[];
  autoStart?: boolean;
}

/**
 * Manages scenes, transitions, and rendering
 */
export class SceneManager extends EventEmitter {
  private readonly config: Required<SceneManagerConfig>;
  private readonly container: HTMLElement;
  private readonly renderer: WebGLRenderer;
  private readonly camera: PerspectiveCamera;
  private readonly scene: Scene;
  private readonly clock: Clock;
  private readonly controls: OrbitControls;

  private readonly layerManager: LayerManager;
  private readonly layerIntegration: LayerIntegration;
  private readonly scenes: Map<string, SceneConfig>;

  private activeScene: string | null;
  private isRunning: boolean;
  private animationFrame: number | null;

  constructor(config: SceneManagerConfig) {
    super();

    this.config = {
      container: config.container,
      defaultScene: config.defaultScene ?? 'default',
      scenes: config.scenes ?? [],
      autoStart: config.autoStart ?? true,
    };

    this.container = config.container;
    this.scenes = new Map();
    this.activeScene = null;
    this.isRunning = false;
    this.animationFrame = null;

    // Initialize Three.js
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(
      this.container.clientWidth,
      this.container.clientHeight
    );
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      this.container.clientWidth / this.container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 5, 10);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.clock = new Clock();

    // Initialize managers
    this.layerManager = new LayerManager(this.scene);
    this.layerIntegration = new LayerIntegration(
      this.layerManager,
      this.scene,
      this.renderer,
      this.camera
    );

    // Initialize scenes
    this.config.scenes.forEach((scene) => {
      this.addScene(scene);
    });

    // Setup event listeners
    window.addEventListener('resize', this.handleResize);

    // Auto start if configured
    if (this.config.autoStart) {
      this.start();
    }
  }

  /**
   * Start scene manager
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.clock.start();

    // Load default scene
    if (!this.activeScene) {
      this.loadScene(this.config.defaultScene);
    }

    // Start render loop
    this.animate();

    this.emit('started');
  }

  /**
   * Stop scene manager
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.clock.stop();

    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }

    this.emit('stopped');
  }

  /**
   * Add a scene configuration
   */
  public addScene(config: SceneConfig): void {
    this.scenes.set(config.id, config);
    this.emit('sceneAdded', config);
  }

  /**
   * Remove a scene configuration
   */
  public removeScene(id: string): void {
    const scene = this.scenes.get(id);
    if (scene) {
      if (this.activeScene === id) {
        this.loadScene(this.config.defaultScene);
      }
      this.scenes.delete(id);
      this.emit('sceneRemoved', scene);
    }
  }

  /**
   * Load a scene
   */
  public async loadScene(id: string): Promise<void> {
    const scene = this.scenes.get(id);
    if (!scene) {
      throw new Error(`Invalid scene: ${id}`);
    }

    // Call onLeave for current scene
    if (this.activeScene) {
      const currentScene = this.scenes.get(this.activeScene);
      await currentScene?.onLeave?.();
    }

    // Apply preset if specified
    if (scene.preset) {
      await this.layerIntegration.applyPreset(scene.preset);
    }

    // Update camera
    if (scene.camera) {
      if (scene.camera.position) {
        this.camera.position.copy(scene.camera.position);
      }
      if (scene.camera.target) {
        this.controls.target.copy(scene.camera.target);
      }
      if (scene.camera.fov) {
        this.camera.fov = scene.camera.fov;
        this.camera.updateProjectionMatrix();
      }
    }

    // Update controls
    if (scene.controls) {
      this.controls.enabled = scene.controls.enabled ?? true;
      this.controls.autoRotate = scene.controls.autoRotate ?? false;
      this.controls.enableDamping = scene.controls.enableDamping ?? true;
    }

    // Update active scene
    this.activeScene = id;

    // Call onEnter for new scene
    await scene.onEnter?.();

    this.emit('sceneLoaded', scene);
  }

  /**
   * Transition between scenes
   */
  public async transitionToScene(config: SceneTransition): Promise<void> {
    const fromScene = this.scenes.get(config.from);
    const toScene = this.scenes.get(config.to);

    if (!fromScene || !toScene) {
      throw new Error(`Invalid scenes: ${config.from} -> ${config.to}`);
    }

    // Start transition
    config.onStart?.();
    this.emit('transitionStart', config);

    // Transition layers
    await this.layerIntegration.transition({
      from: config.from,
      to: config.to,
      duration: config.duration,
      type: config.type,
    });

    // Update scene
    await this.loadScene(config.to);

    // Complete transition
    config.onComplete?.();
    this.emit('transitionComplete', config);
  }

  /**
   * Animation loop
   */
  private animate = (): void => {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();

    // Update controls
    this.controls.update();

    // Update layers
    this.layerManager.update(deltaTime);

    // Render
    this.renderer.render(this.scene, this.camera);

    // Continue loop
    this.animationFrame = requestAnimationFrame(this.animate);
  };

  /**
   * Handle window resize
   */
  private handleResize = (): void => {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  };

  /**
   * Cleanup
   */
  public dispose(): void {
    // Stop animation
    this.stop();

    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Dispose Three.js
    this.renderer.dispose();
    this.controls.dispose();

    // Remove from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    // Clear references
    this.scenes.clear();
    this.activeScene = null;

    this.emit('disposed');
  }
}
