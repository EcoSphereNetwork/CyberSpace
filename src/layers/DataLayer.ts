import { Layer, LayerConfig } from '@/core/layers/Layer';
import {
  Object3D,
  Vector3,
  Color,
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  LineSegments,
  ShaderMaterial,
  AdditiveBlending,
  Mesh,
  SphereGeometry,
  MeshBasicMaterial,
  Line,
  CatmullRomCurve3,
  TubeGeometry,
  Matrix4,
  InstancedMesh,
  DynamicDrawUsage,
} from 'three';

interface DataPoint {
  id: string;
  position: Vector3;
  value: number;
  category?: string;
  color?: number;
  size?: number;
  metadata?: Record<string, any>;
}

interface DataConnection {
  id: string;
  from: string;
  to: string;
  value?: number;
  type?: string;
  color?: number;
  width?: number;
  animated?: boolean;
  metadata?: Record<string, any>;
}

interface DataCluster {
  id: string;
  points: string[];
  center?: Vector3;
  radius?: number;
  color?: number;
  metadata?: Record<string, any>;
}

interface DataFlow {
  id: string;
  path: Vector3[];
  value?: number;
  color?: number;
  width?: number;
  speed?: number;
  metadata?: Record<string, any>;
}

interface DataLayerConfig extends LayerConfig {
  points?: DataPoint[];
  connections?: DataConnection[];
  clusters?: DataCluster[];
  flows?: DataFlow[];
  maxPoints?: number;
  maxConnections?: number;
  defaultSize?: number;
  defaultColor?: number;
  animated?: boolean;
}

/**
 * Layer for data visualization in 3D space
 */
export class DataLayer extends Layer {
  private readonly dataConfig: DataLayerConfig;
  private points: Map<string, Object3D>;
  private connections: Map<string, Object3D>;
  private clusters: Map<string, Object3D>;
  private flows: Map<string, Object3D>;

  // Shaders
  private static readonly pointShader = {
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      attribute float value;
      varying vec3 vColor;
      varying float vValue;
      void main() {
        vColor = color;
        vValue = value;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vValue;
      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        float alpha = smoothstep(0.5, 0.4, dist);
        float glow = exp(-dist * 3.0) * vValue;
        gl_FragColor = vec4(vColor, alpha) + vec4(vColor * glow, glow * 0.5);
      }
    `,
  };

  private static readonly flowShader = {
    vertexShader: `
      uniform float time;
      attribute float progress;
      varying float vProgress;
      varying vec2 vUv;
      void main() {
        vProgress = fract(progress + time);
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      uniform float value;
      varying float vProgress;
      varying vec2 vUv;
      void main() {
        float alpha = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
        alpha *= smoothstep(0.0, 0.1, vProgress) * smoothstep(1.0, 0.9, vProgress);
        gl_FragColor = vec4(color, alpha * value);
      }
    `,
  };

  constructor(config: DataLayerConfig) {
    super(config);
    this.dataConfig = config;
    this.points = new Map();
    this.connections = new Map();
    this.clusters = new Map();
    this.flows = new Map();
  }

  protected async loadResources(): Promise<void> {
    // Create materials
    this.resources.materials.set(
      'point',
      new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
        },
        vertexShader: DataLayer.pointShader.vertexShader,
        fragmentShader: DataLayer.pointShader.fragmentShader,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      })
    );

    this.resources.materials.set(
      'flow',
      new ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color: { value: new Color(0x00ff00) },
          value: { value: 1.0 },
        },
        vertexShader: DataLayer.flowShader.vertexShader,
        fragmentShader: DataLayer.flowShader.fragmentShader,
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
      })
    );

    // Load initial data
    if (this.dataConfig.points) {
      for (const point of this.dataConfig.points) {
        await this.createDataPoint(point);
      }
    }

    if (this.dataConfig.connections) {
      for (const connection of this.dataConfig.connections) {
        await this.createDataConnection(connection);
      }
    }

    if (this.dataConfig.clusters) {
      for (const cluster of this.dataConfig.clusters) {
        await this.createDataCluster(cluster);
      }
    }

    if (this.dataConfig.flows) {
      for (const flow of this.dataConfig.flows) {
        await this.createDataFlow(flow);
      }
    }
  }

  protected async setup(): Promise<void> {
    // Additional setup if needed
  }

  protected updateLayer(deltaTime: number): void {
    // Update materials
    this.updateMaterials(deltaTime);

    // Update flows
    this.flows.forEach((flow, id) => {
      this.updateFlow(flow, deltaTime);
    });

    // Update clusters
    this.clusters.forEach((cluster, id) => {
      this.updateCluster(cluster, deltaTime);
    });
  }

  /**
   * Create a data point
   */
  private async createDataPoint(config: DataPoint): Promise<Object3D> {
    const geometry = new BufferGeometry();
    const positions = new Float32Array([
      config.position.x,
      config.position.y,
      config.position.z,
    ]);
    const colors = new Float32Array([
      ((config.color ?? this.dataConfig.defaultColor ?? 0x00ff00) >> 16) &
        (255 / 255),
      ((config.color ?? this.dataConfig.defaultColor ?? 0x00ff00) >> 8) &
        (255 / 255),
      (config.color ?? this.dataConfig.defaultColor ?? 0x00ff00) & (255 / 255),
    ]);
    const sizes = new Float32Array([
      config.size ?? this.dataConfig.defaultSize ?? 1,
    ]);
    const values = new Float32Array([config.value]);

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('value', new Float32BufferAttribute(values, 1));

    const material = this.resources.materials.get('point')!.clone();
    const point = new Points(geometry, material);
    point.userData = config;

    // Store point
    this.points.set(config.id, point);
    this.resources.objects.set(`point_${config.id}`, point);

    // Add to root
    this.root.add(point);

    return point;
  }

  /**
   * Create a data connection
   */
  private async createDataConnection(
    config: DataConnection
  ): Promise<Object3D> {
    const fromPoint = this.points.get(config.from);
    const toPoint = this.points.get(config.to);

    if (!fromPoint || !toPoint) {
      throw new Error(
        `Invalid connection points: ${config.from} -> ${config.to}`
      );
    }

    const geometry = new BufferGeometry();
    const material = new ShaderMaterial({
      uniforms: {
        color: { value: new Color(config.color ?? 0x00ff00) },
        value: { value: config.value ?? 1 },
        time: { value: 0 },
      },
      vertexShader: `
        uniform float time;
        varying float vProgress;
        void main() {
          vProgress = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float value;
        varying float vProgress;
        void main() {
          float alpha = sin(vProgress * 3.14159);
          gl_FragColor = vec4(color, alpha * value);
        }
      `,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false,
    });

    const line = new Line(geometry, material);
    line.userData = config;

    // Store connection
    this.connections.set(config.id, line);
    this.resources.objects.set(`connection_${config.id}`, line);

    // Add to root
    this.root.add(line);

    return line;
  }

  /**
   * Create a data cluster
   */
  private async createDataCluster(config: DataCluster): Promise<Object3D> {
    const points = config.points
      .map((id) => this.points.get(id))
      .filter((point) => point !== undefined) as Object3D[];

    if (points.length === 0) {
      throw new Error(`No valid points for cluster: ${config.id}`);
    }

    // Calculate cluster center if not provided
    const center = config.center ?? this.calculateClusterCenter(points);
    const radius = config.radius ?? this.calculateClusterRadius(points, center);

    const geometry = new SphereGeometry(radius, 32, 32);
    const material = new MeshBasicMaterial({
      color: config.color ?? 0x00ff00,
      transparent: true,
      opacity: 0.2,
      wireframe: true,
    });

    const cluster = new Mesh(geometry, material);
    cluster.position.copy(center);
    cluster.userData = { ...config, points };

    // Store cluster
    this.clusters.set(config.id, cluster);
    this.resources.objects.set(`cluster_${config.id}`, cluster);

    // Add to root
    this.root.add(cluster);

    return cluster;
  }

  /**
   * Create a data flow
   */
  private async createDataFlow(config: DataFlow): Promise<Object3D> {
    const curve = new CatmullRomCurve3(config.path);
    const geometry = new TubeGeometry(curve, 64, config.width ?? 0.1, 8, false);
    const material = this.resources.materials.get('flow')!.clone();

    material.uniforms.color.value = new Color(config.color ?? 0x00ff00);
    material.uniforms.value.value = config.value ?? 1;

    const flow = new Mesh(geometry, material);
    flow.userData = config;

    // Store flow
    this.flows.set(config.id, flow);
    this.resources.objects.set(`flow_${config.id}`, flow);

    // Add to root
    this.root.add(flow);

    return flow;
  }

  /**
   * Calculate cluster center
   */
  private calculateClusterCenter(points: Object3D[]): Vector3 {
    const center = new Vector3();
    points.forEach((point) => {
      center.add(point.position);
    });
    return center.divideScalar(points.length);
  }

  /**
   * Calculate cluster radius
   */
  private calculateClusterRadius(points: Object3D[], center: Vector3): number {
    let maxDistance = 0;
    points.forEach((point) => {
      const distance = point.position.distanceTo(center);
      if (distance > maxDistance) {
        maxDistance = distance;
      }
    });
    return maxDistance;
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
   * Update flow
   */
  private updateFlow(flow: Object3D, deltaTime: number): void {
    if (flow.material instanceof ShaderMaterial) {
      flow.material.uniforms.time.value +=
        deltaTime * (flow.userData.speed ?? 1);
    }
  }

  /**
   * Update cluster
   */
  private updateCluster(cluster: Object3D, deltaTime: number): void {
    // Add cluster animation or updates here
  }

  // Public API methods...
  // (Add methods for adding/removing/updating data points, connections, clusters, and flows)
}
