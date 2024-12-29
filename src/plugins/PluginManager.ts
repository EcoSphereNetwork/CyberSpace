import { EventEmitter } from '@/utils/EventEmitter';
import { App } from '@/core/App';
import {
  BasePlugin,
  PluginAPI,
  PluginMetadata,
  PluginStorage,
} from './PluginAPI';

interface PluginInstance {
  metadata: PluginMetadata;
  instance: BasePlugin;
  enabled: boolean;
  loaded: boolean;
}

interface PluginManagerConfig {
  autoEnable?: boolean;
  storagePrefix?: string;
  maxPlugins?: number;
  updateInterval?: number;
}

/**
 * Manages plugin lifecycle and provides plugin API
 */
export class PluginManager extends EventEmitter {
  private readonly app: App;
  private readonly config: Required<PluginManagerConfig>;
  private readonly plugins: Map<string, PluginInstance>;
  private readonly api: PluginAPI;
  private updateInterval: number | null;

  constructor(app: App, config: PluginManagerConfig = {}) {
    super();

    this.app = app;
    this.config = {
      autoEnable: config.autoEnable ?? true,
      storagePrefix: config.storagePrefix ?? 'plugin:',
      maxPlugins: config.maxPlugins ?? 100,
      updateInterval: config.updateInterval ?? 1000 / 60, // 60 FPS
    };

    this.plugins = new Map();
    this.api = new PluginAPI(app);
    this.updateInterval = null;

    // Bind methods
    this.update = this.update.bind(this);
  }

  /**
   * Initialize plugin manager
   */
  public async initialize(): Promise<void> {
    // Start update loop
    this.updateInterval = window.setInterval(
      this.update,
      this.config.updateInterval
    );

    this.emit('initialized');
  }

  /**
   * Shutdown plugin manager
   */
  public async shutdown(): Promise<void> {
    // Stop update loop
    if (this.updateInterval !== null) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Unload all plugins
    for (const [pluginId, plugin] of this.plugins) {
      await this.unloadPlugin(pluginId);
    }

    this.emit('shutdown');
  }

  /**
   * Install a plugin
   */
  public async installPlugin(
    pluginId: string,
    metadata: PluginMetadata
  ): Promise<void> {
    if (this.plugins.size >= this.config.maxPlugins) {
      throw new Error('Maximum number of plugins reached');
    }

    if (this.plugins.has(pluginId)) {
      throw new Error(`Plugin ${pluginId} is already installed`);
    }

    // Validate metadata
    this.validateMetadata(metadata);

    // Check dependencies
    await this.checkDependencies(metadata);

    // Create plugin instance
    const plugin = await this.createPluginInstance(metadata);

    // Store plugin
    this.plugins.set(pluginId, {
      metadata,
      instance: plugin,
      enabled: false,
      loaded: false,
    });

    // Auto-enable if configured
    if (this.config.autoEnable) {
      await this.enablePlugin(pluginId);
    }

    this.emit('pluginInstalled', pluginId);
  }

  /**
   * Uninstall a plugin
   */
  public async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    // Disable and unload first
    await this.disablePlugin(pluginId);
    await this.unloadPlugin(pluginId);

    // Remove plugin
    this.plugins.delete(pluginId);

    this.emit('pluginUninstalled', pluginId);
  }

  /**
   * Enable a plugin
   */
  public async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (plugin.enabled) {
      return;
    }

    // Load first if needed
    if (!plugin.loaded) {
      await this.loadPlugin(pluginId);
    }

    // Enable plugin
    await plugin.instance.onEnable?.();
    plugin.enabled = true;

    this.emit('pluginEnabled', pluginId);
  }

  /**
   * Disable a plugin
   */
  public async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (!plugin.enabled) {
      return;
    }

    // Disable plugin
    await plugin.instance.onDisable?.();
    plugin.enabled = false;

    this.emit('pluginDisabled', pluginId);
  }

  /**
   * Load a plugin
   */
  private async loadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (plugin.loaded) {
      return;
    }

    // Load plugin
    await plugin.instance.onLoad?.();
    plugin.loaded = true;

    this.emit('pluginLoaded', pluginId);
  }

  /**
   * Unload a plugin
   */
  private async unloadPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} is not installed`);
    }

    if (!plugin.loaded) {
      return;
    }

    // Disable first if needed
    if (plugin.enabled) {
      await this.disablePlugin(pluginId);
    }

    // Unload plugin
    await plugin.instance.onUnload?.();
    plugin.loaded = false;

    this.emit('pluginUnloaded', pluginId);
  }

  /**
   * Update all enabled plugins
   */
  private update(): void {
    const deltaTime = this.config.updateInterval / 1000;

    for (const [pluginId, plugin] of this.plugins) {
      if (plugin.enabled) {
        try {
          plugin.instance.onUpdate?.(deltaTime);
        } catch (error) {
          console.error(`Error updating plugin ${pluginId}:`, error);
          this.emit('error', { pluginId, error });
        }
      }
    }
  }

  /**
   * Validate plugin metadata
   */
  private validateMetadata(metadata: PluginMetadata): void {
    const required = ['id', 'name', 'version'];
    for (const field of required) {
      if (!metadata[field]) {
        throw new Error(`Missing required metadata field: ${field}`);
      }
    }
  }

  /**
   * Check plugin dependencies
   */
  private async checkDependencies(metadata: PluginMetadata): Promise<void> {
    if (!metadata.dependencies) {
      return;
    }

    for (const [depId, version] of Object.entries(metadata.dependencies)) {
      const dep = this.plugins.get(depId);
      if (!dep) {
        throw new Error(`Missing dependency: ${depId}`);
      }

      // TODO: Add version compatibility check
    }
  }

  /**
   * Create plugin storage
   */
  private createPluginStorage(pluginId: string): PluginStorage {
    const prefix = `${this.config.storagePrefix}${pluginId}:`;

    return {
      async get<T>(key: string): Promise<T | null> {
        const value = localStorage.getItem(`${prefix}${key}`);
        return value ? JSON.parse(value) : null;
      },

      async set<T>(key: string, value: T): Promise<void> {
        localStorage.setItem(`${prefix}${key}`, JSON.stringify(value));
      },

      async remove(key: string): Promise<void> {
        localStorage.removeItem(`${prefix}${key}`);
      },

      async clear(): Promise<void> {
        for (const key of Object.keys(localStorage)) {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        }
      },
    };
  }

  /**
   * Create plugin instance
   */
  private async createPluginInstance(
    metadata: PluginMetadata
  ): Promise<BasePlugin> {
    // Create plugin context
    const context = {
      app: this.app,
      metadata,
      storage: this.createPluginStorage(metadata.id),
      api: this.api,
    };

    // Load plugin module
    const module = await import(`@/plugins/${metadata.id}`);
    const PluginClass = module.default;

    // Create instance
    return new PluginClass(context);
  }

  /**
   * Get plugin metadata
   */
  public getPluginMetadata(pluginId: string): PluginMetadata | null {
    return this.plugins.get(pluginId)?.metadata ?? null;
  }

  /**
   * Get all installed plugins
   */
  public getInstalledPlugins(): PluginMetadata[] {
    return Array.from(this.plugins.values()).map((p) => p.metadata);
  }

  /**
   * Check if plugin is enabled
   */
  public isPluginEnabled(pluginId: string): boolean {
    return this.plugins.get(pluginId)?.enabled ?? false;
  }

  /**
   * Check if plugin is loaded
   */
  public isPluginLoaded(pluginId: string): boolean {
    return this.plugins.get(pluginId)?.loaded ?? false;
  }
}
