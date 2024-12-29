import { Layer, LayerConfig } from '@/core/layers/Layer';
import {
  Mesh,
  BoxGeometry,
  MeshBasicMaterial,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  PointsMaterial,
  Vector3,
  Line,
  LineBasicMaterial,
  Object3D,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  Color
} from 'three';

interface DigitalNode {
  id: string;
  position: Vector3;
  type: 'server' | 'client' | 'router' | 'switch' | 'custom';
  size?: number;
  color?: number;
  label?: string;
  metadata?: Record<string, any>;
}

interface DigitalConnection {
  id: string;
  from: string;
  to: string;
  type: 'network' | 'data' | 'control' | 'custom';
  color?: number;
  width?: number;
  animated?: boolean;
  metadata?: Record<string, any>;
}

interface DigitalParticle {
  position: Vector3;
  velocity: Vector3;
  size?: number;
  color?: number;
  lifetime?: number;
}

interface DigitalLayerConfig extends LayerConfig {
  nodes?: DigitalNode[];
  connections?: DigitalConnection[];
  particles?: {
    enabled?: boolean;
    count?: number;
    size?: number;
    color?: number;
    speed?: number;
  };
}

/**
 * Layer for digital/network visualization
 */
export class DigitalLayer extends Layer {
  private readonly digitalConfig: DigitalLayerConfig;
  private nodes: Map<string, Object3D>;
  private connections: Map<string, Object3D>;
  private particles: DigitalParticle[];
  private particleSystem: Points | null;

  constructor(config: DigitalLayerConfig) {
    super(config);
    this.digitalConfig = config;
    this.nodes = new Map();
    this.connections = new Map();
    this.particles = [];
    this.particleSystem = null;
  }

  protected async loadResources(): Promise<void> {
    // Load textures
    const textureLoader = new TextureLoader();
    const nodeTexture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        '/assets/textures/node.png',
        resolve,
        undefined,
        reject
      );
    });
    this.resources.textures.set('node', nodeTexture);

    // Create materials
    this.resources.materials.set('node', new SpriteMaterial({
      map: nodeTexture,
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    }));

    this.resources.materials.set('connection', new LineBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.5
    }));

    this.resources.materials.set('particle', new PointsMaterial({
      color: this.digitalConfig.particles?.color ?? 0x00ff00,
      size: this.digitalConfig.particles?.size ?? 0.1,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true
    }));

    // Create nodes
    if (this.digitalConfig.nodes) {
      for (const node of this.digitalConfig.nodes) {
        await this.createNode(node);
      }
    }

    // Create connections
    if (this.digitalConfig.connections) {
      for (const connection of this.digitalConfig.connections) {
        await this.createConnection(connection);
      }
    }

    // Setup particle system
    if (this.digitalConfig.particles?.enabled) {
      this.setupParticleSystem();
    }
  }

  protected async setup(): Promise<void> {
    // Additional setup if needed
  }

  protected updateLayer(deltaTime: number): void {
    // Update particles
    if (this.particleSystem && this.particles.length > 0) {
      this.updateParticles(deltaTime);
    }

    // Update animated connections
    this.updateConnections(deltaTime);
  }

  /**
   * Create a digital node
   */
  private async createNode(config: DigitalNode): Promise<Object3D> {
    const sprite = new Sprite(this.resources.materials.get('node')!.clone());
    sprite.position.copy(config.position);
    sprite.scale.setScalar(config.size ?? 1);

    if (config.color) {
      (sprite.material as SpriteMaterial).color = new Color(config.color);
    }

    // Store node
    this.nodes.set(config.id, sprite);
    this.resources.objects.set(`node_${config.id}`, sprite);

    // Add to root
    this.root.add(sprite);

    return sprite;
  }

  /**
   * Create a digital connection
   */
  private async createConnection(config: DigitalConnection): Promise<Object3D> {
    const fromNode = this.nodes.get(config.from);
    const toNode = this.nodes.get(config.to);

    if (!fromNode || !toNode) {
      throw new Error(`Invalid connection nodes: ${config.from} -> ${config.to}`);
    }

    const geometry = new BufferGeometry();
    const positions = new Float32Array([
      fromNode.position.x, fromNode.position.y, fromNode.position.z,
      toNode.position.x, toNode.position.y, toNode.position.z
    ]);
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));

    const material = (this.resources.materials.get('connection') as LineBasicMaterial).clone();
    if (config.color) {
      material.color = new Color(config.color);
    }
    if (config.width) {
      material.linewidth = config.width;
    }

    const line = new Line(geometry, material);

    // Store connection
    this.connections.set(config.id, line);
    this.resources.objects.set(`connection_${config.id}`, line);

    // Add to root
    this.root.add(line);

    return line;
  }

  /**
   * Setup particle system
   */
  private setupParticleSystem(): void {
    const count = this.digitalConfig.particles?.count ?? 1000;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const particle = this.createParticle();
      this.particles.push(particle);

      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;

      const color = new Color(particle.color ?? 0x00ff00);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

    this.particleSystem = new Points(
      geometry,
      this.resources.materials.get('particle')
    );

    this.root.add(this.particleSystem);
  }

  /**
   * Create a particle
   */
  private createParticle(): DigitalParticle {
    return {
      position: new Vector3(
        Math.random() * 20 - 10,
        Math.random() * 20 - 10,
        Math.random() * 20 - 10
      ),
      velocity: new Vector3(
        Math.random() * 2 - 1,
        Math.random() * 2 - 1,
        Math.random() * 2 - 1
      ).normalize().multiplyScalar(this.digitalConfig.particles?.speed ?? 1),
      size: Math.random() * 0.1 + 0.05,
      color: this.digitalConfig.particles?.color ?? 0x00ff00,
      lifetime: Math.random() * 5 + 5
    };
  }

  /**
   * Update particles
   */
  private updateParticles(deltaTime: number): void {
    if (!this.particleSystem) return;

    const positions = this.particleSystem.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < this.particles.length; i++) {
      const particle = this.particles[i];

      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime));

      // Update lifetime
      if (particle.lifetime !== undefined) {
        particle.lifetime -= deltaTime;
        if (particle.lifetime <= 0) {
          // Reset particle
          Object.assign(particle, this.createParticle());
        }
      }

      // Update buffer
      positions[i * 3] = particle.position.x;
      positions[i * 3 + 1] = particle.position.y;
      positions[i * 3 + 2] = particle.position.z;
    }

    this.particleSystem.geometry.attributes.position.needsUpdate = true;
  }

  /**
   * Update connections
   */
  private updateConnections(deltaTime: number): void {
    // Update animated connections
    this.connections.forEach((line, id) => {
      // Add animation logic here
    });
  }

  /**
   * Add node
   */
  public async addNode(node: DigitalNode): Promise<Object3D> {
    const obj = await this.createNode(node);
    this.emit('nodeAdded', node);
    return obj;
  }

  /**
   * Remove node
   */
  public removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (node) {
      node.removeFromParent();
      this.nodes.delete(id);
      this.resources.objects.delete(`node_${id}`);
      this.emit('nodeRemoved', id);
    }
  }

  /**
   * Add connection
   */
  public async addConnection(connection: DigitalConnection): Promise<Object3D> {
    const obj = await this.createConnection(connection);
    this.emit('connectionAdded', connection);
    return obj;
  }

  /**
   * Remove connection
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
   * Set particle system enabled
   */
  public setParticlesEnabled(enabled: boolean): void {
    if (enabled && !this.particleSystem) {
      this.setupParticleSystem();
    } else if (!enabled && this.particleSystem) {
      this.particleSystem.removeFromParent();
      this.particleSystem = null;
      this.particles = [];
    }
    this.emit('particlesEnabledChanged', enabled);
  }

  /**
   * Set particle system properties
   */
  public setParticleProperties(properties: {
    count?: number;
    size?: number;
    color?: number;
    speed?: number;
  }): void {
    if (properties.color !== undefined) {
      (this.resources.materials.get('particle') as PointsMaterial).color.setHex(properties.color);
    }
    if (properties.size !== undefined) {
      (this.resources.materials.get('particle') as PointsMaterial).size = properties.size;
    }
    if (properties.count !== undefined || properties.speed !== undefined) {
      // Recreate particle system with new properties
      if (this.particleSystem) {
        this.particleSystem.removeFromParent();
        this.particleSystem = null;
        this.particles = [];
        this.setupParticleSystem();
      }
    }
    this.emit('particlePropertiesChanged', properties);
  }
}