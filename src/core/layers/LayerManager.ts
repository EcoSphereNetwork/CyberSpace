import { Layer, LayerConfig } from "./Layer";

interface LayerEntry {
  instance: Layer;
  config: LayerConfig;
}

export class LayerManager {
  private layers: Map<string, LayerEntry>;

  constructor() {
    this.layers = new Map();
  }

  public async addLayer(id: string, config: LayerConfig = {}): Promise<void> {
    if (this.layers.has(id)) {
      throw new Error(`Layer with id "${id}" already exists`);
    }

    const layer = new Layer(config);
    await layer.initialize();

    this.layers.set(id, {
      instance: layer,
      config,
    });
  }

  public async removeLayer(id: string): Promise<void> {
    const layer = this.layers.get(id);
    if (!layer) {
      throw new Error(`Layer with id "${id}" not found`);
    }

    await layer.instance.dispose();
    this.layers.delete(id);
  }

  public getLayer(id: string): Layer | undefined {
    return this.layers.get(id)?.instance;
  }

  public getLayers(): Layer[] {
    return Array.from(this.layers.values()).map(entry => entry.instance);
  }

  public hasLayer(id: string): boolean {
    return this.layers.has(id);
  }

  public async update(deltaTime: number): Promise<void> {
    for (const layer of this.getLayers()) {
      if (layer.isEnabled()) {
        await layer.update(deltaTime);
      }
    }
  }

  public async render(): Promise<void> {
    for (const layer of this.getLayers()) {
      if (layer.isVisible()) {
        await layer.render();
      }
    }
  }

  public async dispose(): Promise<void> {
    for (const layer of this.getLayers()) {
      await layer.dispose();
    }
    this.layers.clear();
  }
}
