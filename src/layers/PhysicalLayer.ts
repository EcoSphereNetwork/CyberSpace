import { Layer, LayerConfig } from '@/core/layers/Layer';
import {
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  DirectionalLight,
  AmbientLight,
  GridHelper,
  Vector3,
  Object3D,
  PlaneGeometry,
  SphereGeometry,
  CylinderGeometry,
} from 'three';

interface PhysicalObject {
  type: 'box' | 'sphere' | 'cylinder' | 'plane';
  position: Vector3;
  scale?: Vector3;
  rotation?: Vector3;
  material?: {
    color?: number;
    metalness?: number;
    roughness?: number;
    opacity?: number;
  };
}

interface PhysicalLayerConfig extends LayerConfig {
  objects?: PhysicalObject[];
  lighting?: {
    ambient?: {
      color?: number;
      intensity?: number;
    };
    directional?: {
      color?: number;
      intensity?: number;
      position?: Vector3;
    };
  };
  grid?: {
    size?: number;
    divisions?: number;
    color?: number;
    centerColor?: number;
  };
}

/**
 * Layer for physical world representation
 */
export class PhysicalLayer extends Layer {
  private readonly physicalConfig: PhysicalLayerConfig;

  constructor(config: PhysicalLayerConfig) {
    super(config);
    this.physicalConfig = config;
  }

  protected async loadResources(): Promise<void> {
    // Create default materials
    const defaultMaterial = new MeshStandardMaterial({
      color: 0x808080,
      metalness: 0.1,
      roughness: 0.7,
    });
    this.resources.materials.set('default', defaultMaterial);

    // Load objects
    if (this.physicalConfig.objects) {
      for (const object of this.physicalConfig.objects) {
        await this.createPhysicalObject(object);
      }
    }
  }

  protected async setup(): Promise<void> {
    // Setup lighting
    this.setupLighting();

    // Setup grid
    this.setupGrid();
  }

  protected updateLayer(deltaTime: number): void {
    // Update physics, animations, etc.
  }

  /**
   * Create a physical object
   */
  private async createPhysicalObject(
    config: PhysicalObject
  ): Promise<Object3D> {
    let geometry;
    switch (config.type) {
      case 'box':
        geometry = new BoxGeometry(1, 1, 1);
        break;
      case 'sphere':
        geometry = new SphereGeometry(0.5, 32, 32);
        break;
      case 'cylinder':
        geometry = new CylinderGeometry(0.5, 0.5, 1, 32);
        break;
      case 'plane':
        geometry = new PlaneGeometry(1, 1);
        break;
      default:
        throw new Error(`Unknown object type: ${config.type}`);
    }

    // Create material
    const material = new MeshStandardMaterial({
      color: config.material?.color ?? 0x808080,
      metalness: config.material?.metalness ?? 0.1,
      roughness: config.material?.roughness ?? 0.7,
      opacity: config.material?.opacity ?? 1,
      transparent:
        config.material?.opacity !== undefined && config.material.opacity < 1,
    });

    // Create mesh
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(config.position);
    if (config.scale) mesh.scale.copy(config.scale);
    if (config.rotation) mesh.rotation.setFromVector3(config.rotation);

    // Store resources
    const id = `${config.type}_${this.resources.objects.size}`;
    this.resources.objects.set(id, mesh);
    this.resources.materials.set(`${id}_material`, material);

    // Add to root
    this.root.add(mesh);

    return mesh;
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambientConfig = this.physicalConfig.lighting?.ambient;
    const ambient = new AmbientLight(
      ambientConfig?.color ?? 0x404040,
      ambientConfig?.intensity ?? 0.5
    );
    this.root.add(ambient);
    this.resources.objects.set('ambient_light', ambient);

    // Directional light
    const directionalConfig = this.physicalConfig.lighting?.directional;
    const directional = new DirectionalLight(
      directionalConfig?.color ?? 0xffffff,
      directionalConfig?.intensity ?? 0.8
    );
    if (directionalConfig?.position) {
      directional.position.copy(directionalConfig.position);
    } else {
      directional.position.set(5, 5, 5);
    }
    directional.lookAt(0, 0, 0);
    this.root.add(directional);
    this.resources.objects.set('directional_light', directional);
  }

  /**
   * Setup grid
   */
  private setupGrid(): void {
    const gridConfig = this.physicalConfig.grid;
    const grid = new GridHelper(
      gridConfig?.size ?? 10,
      gridConfig?.divisions ?? 10,
      gridConfig?.centerColor ?? 0x444444,
      gridConfig?.color ?? 0x888888
    );
    grid.position.y = -0.01; // Slight offset to prevent z-fighting
    this.root.add(grid);
    this.resources.objects.set('grid', grid);
  }

  /**
   * Add physical object
   */
  public async addObject(object: PhysicalObject): Promise<Object3D> {
    const obj = await this.createPhysicalObject(object);
    this.emit('objectAdded', obj);
    return obj;
  }

  /**
   * Remove physical object
   */
  public removeObject(id: string): void {
    const object = this.resources.objects.get(id);
    if (object) {
      object.removeFromParent();
      this.resources.objects.delete(id);

      // Remove associated material
      const material = this.resources.materials.get(`${id}_material`);
      if (material) {
        material.dispose();
        this.resources.materials.delete(`${id}_material`);
      }

      this.emit('objectRemoved', id);
    }
  }

  /**
   * Get physical object
   */
  public getObject(id: string): Object3D | undefined {
    return this.resources.objects.get(id);
  }

  /**
   * Set grid visibility
   */
  public setGridVisible(visible: boolean): void {
    const grid = this.resources.objects.get('grid');
    if (grid) {
      grid.visible = visible;
      this.emit('gridVisibilityChanged', visible);
    }
  }

  /**
   * Set ambient light intensity
   */
  public setAmbientIntensity(intensity: number): void {
    const ambient = this.resources.objects.get('ambient_light') as AmbientLight;
    if (ambient) {
      ambient.intensity = intensity;
      this.emit('ambientIntensityChanged', intensity);
    }
  }

  /**
   * Set directional light intensity
   */
  public setDirectionalIntensity(intensity: number): void {
    const directional = this.resources.objects.get(
      'directional_light'
    ) as DirectionalLight;
    if (directional) {
      directional.intensity = intensity;
      this.emit('directionalIntensityChanged', intensity);
    }
  }
}
