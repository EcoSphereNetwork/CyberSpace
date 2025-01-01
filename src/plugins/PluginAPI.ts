import { EventEmitter } from '@/utils/EventEmitter';
import { App } from '@/core/App';

export interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  homepage?: string;
  repository?: string;
  license?: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
}

export interface PluginContext {
  app: App;
  metadata: PluginMetadata;
  storage: PluginStorage;
  api: PluginAPI;
}

export interface PluginStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface PluginLifecycle {
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
  onEnable?(): Promise<void>;
  onDisable?(): Promise<void>;
  onUpdate?(deltaTime: number): void;
}

/**
 * Base class for plugins to extend
 */
export abstract class BasePlugin
  extends EventEmitter
  implements PluginLifecycle
{
  protected readonly context: PluginContext;

  constructor(context: PluginContext) {
    super();
    this.context = context;
  }

  public async onLoad(): Promise<void> {}
  public async onUnload(): Promise<void> {}
  public async onEnable(): Promise<void> {}
  public async onDisable(): Promise<void> {}
  public onUpdate(deltaTime: number): void {}

  protected get app(): App {
    return this.context.app;
  }

  protected get metadata(): PluginMetadata {
    return this.context.metadata;
  }

  protected get storage(): PluginStorage {
    return this.context.storage;
  }

  protected get api(): PluginAPI {
    return this.context.api;
  }
}

/**
 * API exposed to plugins
 */
export class PluginAPI {
  private readonly app: App;

  constructor(app: App) {
    this.app = app;
  }

  // Scene API
  public async loadScene(sceneId: string): Promise<void> {
    return this.app.setActiveScene(sceneId);
  }

  public getActiveScene(): string | null {
    return this.app.getState().activeScene;
  }

  // Layer API
  public async addLayer(layerId: string, config: any): Promise<void> {
    return this.app.layers.addLayer(layerId, config);
  }

  public async removeLayer(layerId: string): Promise<void> {
    return this.app.layers.removeLayer(layerId);
  }

  public getLayer(layerId: string): any {
    return this.app.layers.getLayer(layerId);
  }

  // Resource API
  public async loadResource(resourceId: string): Promise<any> {
    return this.app.resources.load(resourceId);
  }

  public async unloadResource(resourceId: string): Promise<void> {
    return this.app.resources.unload(resourceId);
  }

  // Notification API
  public async notify(message: string, options?: any): Promise<void> {
    return this.app.notifications.show(message, options);
  }

  // VR API
  public async enableVR(): Promise<void> {
    if (!this.app.getState().vrEnabled) {
      await this.app.toggleVR();
    }
  }

  public async disableVR(): Promise<void> {
    if (this.app.getState().vrEnabled) {
      await this.app.toggleVR();
    }
  }

  // Performance API
  public setPerformanceMode(
    mode: 'quality' | 'balanced' | 'performance'
  ): void {
    this.app.setPerformanceMode(mode);
  }

  public getPerformanceStats(): any {
    return this.app.performance.getStats();
  }

  // Security API
  public async checkPermission(permission: string): Promise<boolean> {
    return this.app.security.checkPermission(permission);
  }

  public async requestPermission(permission: string): Promise<boolean> {
    return this.app.security.requestPermission(permission);
  }

  // Event API
  public on(event: string, handler: Function): void {
    this.app.on(event, handler);
  }

  public off(event: string, handler: Function): void {
    this.app.off(event, handler);
  }

  public emit(event: string, ...args: any[]): void {
    this.app.emit(event, ...args);
  }
}
