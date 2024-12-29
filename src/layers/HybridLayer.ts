import { Layer, LayerConfig } from '@/core/layers/Layer';
import { PhysicalLayer } from './PhysicalLayer';
import { DigitalLayer } from './DigitalLayer';
import {
  Object3D,
  Vector3,
  Raycaster,
  Mesh,
  MeshBasicMaterial,
  BoxGeometry,
  Color,
  ShaderMaterial,
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
} from 'three';

interface HybridObject {
  id: string;
  position: Vector3;
  type: 'portal' | 'interface' | 'hologram' | 'custom';
  size?: number;
  color?: number;
  opacity?: number;
  interactive?: boolean;
  metadata?: Record<string, any>;
}

interface HybridConnection {
  id: string;
  from: string;
  to: string;
  type: 'data' | 'energy' | 'custom';
  color?: number;
  width?: number;
  animated?: boolean;
  metadata?: Record<string, any>;
}

interface HybridEffect {
  type: 'glow' | 'pulse' | 'wave' | 'custom';
  color?: number;
  intensity?: number;
  speed?: number;
  size?: number;
}

interface HybridLayerConfig extends LayerConfig {
  objects?: HybridObject[];
  connections?: HybridConnection[];
  effects?: HybridEffect[];
  interaction?: {
    enabled?: boolean;
    highlightColor?: number;
    selectionColor?: number;
  };
}

/**
 * Layer that combines physical and digital elements
 */
export class HybridLayer extends Layer {
  private readonly hybridConfig: HybridLayerConfig;
  private objects: Map<string, Object3D>;
  private connections: Map<string, Object3D>;
  private effects: Map<string, Object3D>;
  private raycaster: Raycaster;
  private selectedObject: Object3D | null;
  private hoveredObject: Object3D | null;

  // Shaders
  private static readonly glowShader = {
    vertexShader: `
      varying vec3 vPosition;
      varying vec2 vUv;
      void main() {
        vPosition = position;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float intensity;
      uniform float time;
      varying vec3 vPosition;
      varying vec2 vUv;
      void main() {
        float dist = length(vUv - vec2(0.5));
        float alpha = smoothstep(0.5, 0.0, dist);
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        gl_FragColor = vec4(color, alpha * intensity * pulse);
      }
    `,
  };

  constructor(config: HybridLayerConfig) {
    super(config);
    this.hybridConfig = config;
    this.objects = new Map();
    this.connections = new Map();
    this.effects = new Map();
    this.raycaster = new Raycaster();
    this.selectedObject = null;
    this.hoveredObject = null;
  }

  protected async loadResources(): Promise<void> {
    // Create materials
    this.resources.materials.set(
      'highlight',
      new MeshBasicMaterial({
        color: this.hybridConfig.interaction?.highlightColor ?? 0x00ff00,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
      })
    );

    this.resources.materials.set(
      'selection',
      new MeshBasicMaterial({
        color: this.hybridConfig.interaction?.selectionColor ?? 0x0000ff,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      })
    );

    // Create glow material
    this.resources.materials.set(
      'glow',
      new ShaderMaterial({
        uniforms: {
          color: { value: new Color(0x00ff00) },
          intensity: { value: 1.0 },
          time: { value: 0.0 },
        },
        vertexShader: HybridLayer.glowShader.vertexShader,
        fragmentShader: HybridLayer.glowShader.fragmentShader,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      })
    );

    // Load objects
    if (this.hybridConfig.objects) {
      for (const object of this.hybridConfig.objects) {
        await this.createHybridObject(object);
      }
    }

    // Create connections
    if (this.hybridConfig.connections) {
      for (const connection of this.hybridConfig.connections) {
        await this.createHybridConnection(connection);
      }
    }

    // Create effects
    if (this.hybridConfig.effects) {
      for (const effect of this.hybridConfig.effects) {
        await this.createHybridEffect(effect);
      }
    }
  }

  protected async setup(): Promise<void> {
    // Setup interaction handlers
    if (this.hybridConfig.interaction?.enabled) {
      this.setupInteraction();
    }
  }

  protected updateLayer(deltaTime: number): void {
    // Update effects
    this.updateEffects(deltaTime);

    // Update connections
    this.updateConnections(deltaTime);

    // Update materials
    this.updateMaterials(deltaTime);
  }

  /**
   * Create a hybrid object
   */
  private async createHybridObject(config: HybridObject): Promise<Object3D> {
    let object: Object3D;

    switch (config.type) {
      case 'portal':
        object = this.createPortal(config);
        break;
      case 'interface':
        object = this.createInterface(config);
        break;
      case 'hologram':
        object = this.createHologram(config);
        break;
      default:
        object = this.createCustomObject(config);
    }

    // Set common properties
    object.position.copy(config.position);
    object.userData.type = config.type;
    object.userData.metadata = config.metadata;
    object.userData.interactive = config.interactive ?? true;

    // Store object
    this.objects.set(config.id, object);
    this.resources.objects.set(`hybrid_${config.id}`, object);

    // Add to root
    this.root.add(object);

    return object;
  }

  /**
   * Create a portal object
   */
  private createPortal(config: HybridObject): Object3D {
    const geometry = new BoxGeometry(config.size ?? 2, config.size ?? 2, 0.1);

    const material = new ShaderMaterial({
      uniforms: {
        color: { value: new Color(config.color ?? 0x00ff00) },
        opacity: { value: config.opacity ?? 0.5 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        uniform float time;
        varying vec2 vUv;
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float ripple = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
          float alpha = smoothstep(0.5, 0.4, dist) * opacity * ripple;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    return new Mesh(geometry, material);
  }

  /**
   * Create an interface object
   */
  private createInterface(config: HybridObject): Object3D {
    const geometry = new BoxGeometry(
      config.size ?? 1,
      config.size ?? 0.75,
      0.05
    );

    const material = new ShaderMaterial({
      uniforms: {
        color: { value: new Color(config.color ?? 0x00ffff) },
        opacity: { value: config.opacity ?? 0.8 },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float opacity;
        uniform float time;
        varying vec2 vUv;
        void main() {
          float scanline = sin(vUv.y * 100.0 + time * 5.0) * 0.5 + 0.5;
          float edge = smoothstep(0.05, 0.0, min(vUv.x, min(1.0 - vUv.x, min(vUv.y, 1.0 - vUv.y))));
          float alpha = (0.8 + scanline * 0.2) * opacity * (1.0 + edge);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    return new Mesh(geometry, material);
  }

  /**
   * Create a hologram object
   */
  private createHologram(config: HybridObject): Object3D {
    const size = config.size ?? 1;
    const points = [];
    const colors = [];
    const color = new Color(config.color ?? 0x00ffff);

    // Create point cloud in a spherical shape
    for (let i = 0; i < 1000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = Math.random() * size;

      points.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );

      colors.push(color.r, color.g, color.b);
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(points, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    const material = new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        opacity: { value: config.opacity ?? 0.5 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        void main() {
          vColor = color;
          vec3 pos = position;
          pos.y += sin(pos.x + time) * 0.1;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = 2.0;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        uniform float opacity;
        void main() {
          gl_FragColor = vec4(vColor, opacity);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    return new Points(geometry, material);
  }

  /**
   * Create a custom object
   */
  private createCustomObject(config: HybridObject): Object3D {
    // Default to a simple mesh
    const geometry = new BoxGeometry(
      config.size ?? 1,
      config.size ?? 1,
      config.size ?? 1
    );

    const material = new MeshBasicMaterial({
      color: config.color ?? 0xffffff,
      transparent: true,
      opacity: config.opacity ?? 1,
    });

    return new Mesh(geometry, material);
  }

  /**
   * Create a hybrid connection
   */
  private async createHybridConnection(
    config: HybridConnection
  ): Promise<Object3D> {
    const fromObj = this.objects.get(config.from);
    const toObj = this.objects.get(config.to);

    if (!fromObj || !toObj) {
      throw new Error(
        `Invalid connection objects: ${config.from} -> ${config.to}`
      );
    }

    const geometry = new BufferGeometry();
    const line = new Object3D();
    line.userData.config = config;

    // Will be updated in updateConnections
    this.connections.set(config.id, line);
    this.resources.objects.set(`connection_${config.id}`, line);
    this.root.add(line);

    return line;
  }

  /**
   * Create a hybrid effect
   */
  private async createHybridEffect(config: HybridEffect): Promise<Object3D> {
    let effect: Object3D;

    switch (config.type) {
      case 'glow':
        effect = this.createGlowEffect(config);
        break;
      case 'pulse':
        effect = this.createPulseEffect(config);
        break;
      case 'wave':
        effect = this.createWaveEffect(config);
        break;
      default:
        effect = this.createCustomEffect(config);
    }

    const id = `effect_${this.effects.size}`;
    this.effects.set(id, effect);
    this.resources.objects.set(id, effect);
    this.root.add(effect);

    return effect;
  }

  /**
   * Create a glow effect
   */
  private createGlowEffect(config: HybridEffect): Object3D {
    // Implementation similar to portal but with different shader
    return new Object3D(); // Placeholder
  }

  /**
   * Create a pulse effect
   */
  private createPulseEffect(config: HybridEffect): Object3D {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create a wave effect
   */
  private createWaveEffect(config: HybridEffect): Object3D {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create a custom effect
   */
  private createCustomEffect(config: HybridEffect): Object3D {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Setup interaction handlers
   */
  private setupInteraction(): void {
    // Implement interaction setup
  }

  /**
   * Update effects
   */
  private updateEffects(deltaTime: number): void {
    this.effects.forEach((effect, id) => {
      if (effect.material instanceof ShaderMaterial) {
        effect.material.uniforms.time.value += deltaTime;
      }
    });
  }

  /**
   * Update connections
   */
  private updateConnections(deltaTime: number): void {
    this.connections.forEach((connection, id) => {
      const config = connection.userData.config as HybridConnection;
      const fromObj = this.objects.get(config.from);
      const toObj = this.objects.get(config.to);

      if (fromObj && toObj) {
        // Update connection geometry
        // Add animation if needed
      }
    });
  }

  /**
   * Update materials
   */
  private updateMaterials(deltaTime: number): void {
    this.resources.materials.forEach((material) => {
      if (material instanceof ShaderMaterial && material.uniforms.time) {
        material.uniforms.time.value += deltaTime;
      }
    });
  }

  /**
   * Add hybrid object
   */
  public async addObject(object: HybridObject): Promise<Object3D> {
    return this.createHybridObject(object);
  }

  /**
   * Remove hybrid object
   */
  public removeObject(id: string): void {
    const object = this.objects.get(id);
    if (object) {
      object.removeFromParent();
      this.objects.delete(id);
      this.resources.objects.delete(`hybrid_${id}`);
      this.emit('objectRemoved', id);
    }
  }

  /**
   * Add hybrid connection
   */
  public async addConnection(connection: HybridConnection): Promise<Object3D> {
    return this.createHybridConnection(connection);
  }

  /**
   * Remove hybrid connection
   */
  public removeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (connection) {
      connection.removeFromParent();
      this.connections.delete(id);
      this.resources.objects.delete(`connection_${id}`);
      this.emit('connectionRemoved', id);
    }
  }

  /**
   * Add hybrid effect
   */
  public async addEffect(effect: HybridEffect): Promise<Object3D> {
    return this.createHybridEffect(effect);
  }

  /**
   * Remove hybrid effect
   */
  public removeEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.removeFromParent();
      this.effects.delete(id);
      this.resources.objects.delete(id);
      this.emit('effectRemoved', id);
    }
  }
}
