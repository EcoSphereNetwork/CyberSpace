import { EventEmitter } from '@/utils/EventEmitter';
import { ResourceManager } from './ResourceManager';
import { SecurityManager } from '@/services/auth/SecurityManager';
import { PluginManager } from '@/plugins/PluginManager';
import { NotificationSystem } from '@/services/notifications/NotificationSystem';
import { LayerManager } from './layers/LayerManager';
import { SceneManager } from '@/scenes/SceneManager';
import { WebXRManager } from '@/vr/WebXRManager';
import { PerformanceMonitor } from '@/utils/PerformanceMonitor';

export interface AppConfig {
  debug?: boolean;
  plugins?: string[];
  defaultScene?: string;
  vr?: {
    enabled: boolean;
    mode?: 'vr' | 'ar' | 'hybrid';
  };
  performance?: {
    monitoring: boolean;
    targetFPS: number;
    autoOptimize: boolean;
  };
}

export interface AppState {
  initialized: boolean;
  activeScene: string | null;
  vrEnabled: boolean;
  performanceMode: 'quality' | 'balanced' | 'performance';
  debug: boolean;
}

/**
 * Main application class that initializes and manages all core systems
 */
export class App extends EventEmitter {
  private static instance: App;
  private state: AppState;

  // Core systems
  public readonly resources: ResourceManager;
  public readonly security: SecurityManager;
  public readonly plugins: PluginManager;
  public readonly notifications: NotificationSystem;
  public readonly layers: LayerManager;
  public readonly scenes: SceneManager;
  public readonly xr: WebXRManager;
  public readonly performance: PerformanceMonitor;

  private constructor(config: AppConfig = {}) {
    super();

    // Initialize state
    this.state = {
      initialized: false,
      activeScene: null,
      vrEnabled: config.vr?.enabled ?? false,
      performanceMode: 'balanced',
      debug: config.debug ?? false,
    };

    // Initialize core systems
    this.resources = new ResourceManager();
    this.security = new SecurityManager({ apiUrl: '' }); // TODO: Add API URL to config
    this.plugins = new PluginManager(this);
    this.notifications = new NotificationSystem();
    this.layers = new LayerManager();
    this.scenes = new SceneManager(this);
    this.xr = new WebXRManager(config.vr);
    this.performance = new PerformanceMonitor(config.performance);

    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.shutdown = this.shutdown.bind(this);
    this.setActiveScene = this.setActiveScene.bind(this);
    this.toggleVR = this.toggleVR.bind(this);
    this.setPerformanceMode = this.setPerformanceMode.bind(this);
  }

  public static getInstance(config?: AppConfig): App {
    if (!App.instance) {
      App.instance = new App(config);
    }
    return App.instance;
  }

  /**
   * Initialize all systems and start the application
   */
  public async initialize(): Promise<void> {
    if (this.state.initialized) {
      console.warn('App already initialized');
      return;
    }

    try {
      // Start performance monitoring
      this.performance.start();

      // Initialize core systems
      await Promise.all([
        this.resources.initialize(),
        this.security.initialize(),
        this.plugins.initialize(),
        this.notifications.initialize(),
        this.layers.initialize(),
        this.scenes.initialize(),
        this.xr.initialize(),
      ]);

      // Set initial scene
      if (this.state.activeScene) {
        await this.setActiveScene(this.state.activeScene);
      }

      this.state.initialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize app:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Gracefully shutdown the application
   */
  public async shutdown(): Promise<void> {
    if (!this.state.initialized) {
      return;
    }

    try {
      // Shutdown in reverse order
      await this.xr.shutdown();
      await this.scenes.shutdown();
      await this.layers.shutdown();
      await this.notifications.shutdown();
      await this.plugins.shutdown();
      await this.security.shutdown();
      await this.resources.shutdown();

      this.performance.stop();

      this.state.initialized = false;
      this.emit('shutdown');
    } catch (error) {
      console.error('Error during shutdown:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Set the active scene
   */
  public async setActiveScene(sceneId: string): Promise<void> {
    if (!this.state.initialized) {
      throw new Error('App not initialized');
    }

    try {
      await this.scenes.setActiveScene(sceneId);
      this.state.activeScene = sceneId;
      this.emit('sceneChanged', sceneId);
    } catch (error) {
      console.error('Failed to set active scene:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Toggle VR mode
   */
  public async toggleVR(): Promise<void> {
    if (!this.state.initialized) {
      throw new Error('App not initialized');
    }

    try {
      const enabled = await this.xr.toggle();
      this.state.vrEnabled = enabled;
      this.emit('vrToggled', enabled);
    } catch (error) {
      console.error('Failed to toggle VR:', error);
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Set performance mode
   */
  public setPerformanceMode(mode: AppState['performanceMode']): void {
    this.state.performanceMode = mode;
    this.performance.setMode(mode);
    this.emit('performanceModeChanged', mode);
  }

  /**
   * Get current app state
   */
  public getState(): Readonly<AppState> {
    return { ...this.state };
  }

  /**
   * Check if app is initialized
   */
  public isInitialized(): boolean {
    return this.state.initialized;
  }

  /**
   * Enable/disable debug mode
   */
  public setDebug(enabled: boolean): void {
    this.state.debug = enabled;
    this.emit('debugChanged', enabled);
  }
}
