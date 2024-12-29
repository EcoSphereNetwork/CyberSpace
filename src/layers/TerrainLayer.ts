import { Layer, LayerConfig } from '@/core/layers/Layer';
import {
  Object3D,
  PlaneGeometry,
  ShaderMaterial,
  Mesh,
  TextureLoader,
  RepeatWrapping,
  Vector2,
  Vector3,
  Color,
  BufferAttribute,
  BufferGeometry,
  Points,
  InstancedMesh,
  Matrix4,
  DynamicDrawUsage,
  MeshPhongMaterial,
  DirectionalLight,
  AmbientLight
} from 'three';
import SimplexNoise from 'simplex-noise';

interface TerrainConfig {
  size?: Vector2;
  segments?: Vector2;
  heightScale?: number;
  minHeight?: number;
  maxHeight?: number;
  roughness?: number;
  seed?: number;
  textures?: {
    heightMap?: string;
    diffuse?: string;
    normal?: string;
    roughness?: string;
  };
  tiling?: Vector2;
}

interface Vegetation {
  type: 'grass' | 'tree' | 'rock' | 'custom';
  density?: number;
  scale?: Vector3;
  color?: number;
  randomness?: number;
  metadata?: Record<string, any>;
}

interface Water {
  level?: number;
  color?: number;
  opacity?: number;
  flowSpeed?: number;
  waveHeight?: number;
  waveFrequency?: number;
}

interface TerrainLayerConfig extends LayerConfig {
  terrain?: TerrainConfig;
  vegetation?: Vegetation[];
  water?: Water;
  lighting?: {
    ambient?: {
      color?: number;
      intensity?: number;
    };
    sun?: {
      color?: number;
      intensity?: number;
      position?: Vector3;
    };
  };
}

/**
 * Layer for terrain and landscape features
 */
export class TerrainLayer extends Layer {
  private readonly terrainConfig: TerrainLayerConfig;
  private noise: SimplexNoise;
  private heightData: Float32Array;
  private vegetation: Map<string, InstancedMesh>;
  private waterMesh: Mesh | null;

  // Shaders
  private static readonly terrainShader = {
    vertexShader: \`
      uniform sampler2D heightMap;
      uniform float heightScale;
      uniform float minHeight;
      uniform float maxHeight;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vHeight;
      
      void main() {
        vUv = uv;
        
        // Get height from heightmap or attributes
        float height = position.y;
        if (height < minHeight) height = minHeight;
        if (height > maxHeight) height = maxHeight;
        
        vHeight = (height - minHeight) / (maxHeight - minHeight);
        
        // Calculate normal
        vec3 pos = position;
        pos.y = height * heightScale;
        
        // Transform position and normal
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vNormal = normalMatrix * normal;
        
        gl_Position = projectionMatrix * mvPosition;
      }
    \`,
    fragmentShader: \`
      uniform sampler2D diffuseMap;
      uniform sampler2D normalMap;
      uniform sampler2D roughnessMap;
      uniform vec2 tiling;
      uniform vec3 lowColor;
      uniform vec3 highColor;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      varying float vHeight;
      
      void main() {
        // Sample textures
        vec2 uv = vUv * tiling;
        vec4 diffuse = texture2D(diffuseMap, uv);
        vec4 normal = texture2D(normalMap, uv);
        float roughness = texture2D(roughnessMap, uv).r;
        
        // Height-based coloring
        vec3 color = mix(lowColor, highColor, vHeight);
        
        // Apply lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(vNormal, lightDir), 0.0);
        
        gl_FragColor = vec4(color * diffuse.rgb * diff, 1.0);
      }
    \`
  };

  private static readonly waterShader = {
    vertexShader: \`
      uniform float time;
      uniform float waveHeight;
      uniform float waveFrequency;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        vUv = uv;
        
        // Calculate waves
        float wave = sin(uv.x * waveFrequency + time) * 
                    cos(uv.y * waveFrequency + time) * waveHeight;
        
        vec3 pos = position;
        pos.y += wave;
        
        // Calculate normal
        vec3 tangent = normalize(vec3(1.0, cos(uv.x * waveFrequency + time) * waveHeight, 0.0));
        vec3 bitangent = normalize(vec3(0.0, cos(uv.y * waveFrequency + time) * waveHeight, 1.0));
        vNormal = normalize(cross(tangent, bitangent));
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    \`,
    fragmentShader: \`
      uniform vec3 color;
      uniform float opacity;
      uniform float time;
      
      varying vec2 vUv;
      varying vec3 vNormal;
      
      void main() {
        // Calculate fresnel
        vec3 viewDir = normalize(cameraPosition - vNormal);
        float fresnel = pow(1.0 - max(dot(viewDir, vNormal), 0.0), 3.0);
        
        // Add waves
        float wave = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time) * 0.1;
        
        vec3 finalColor = mix(color, vec3(1.0), fresnel + wave);
        gl_FragColor = vec4(finalColor, opacity);
      }
    \`
  };

  constructor(config: TerrainLayerConfig) {
    super(config);
    this.terrainConfig = config;
    this.noise = new SimplexNoise(config.terrain?.seed?.toString() ?? Math.random().toString());
    this.heightData = new Float32Array(0);
    this.vegetation = new Map();
    this.waterMesh = null;
  }

  protected async loadResources(): Promise<void> {
    // Load textures
    const textureLoader = new TextureLoader();
    const [diffuseMap, normalMap, roughnessMap] = await Promise.all([
      this.loadTexture(textureLoader, this.terrainConfig.terrain?.textures?.diffuse ?? '/assets/textures/terrain_diffuse.png'),
      this.loadTexture(textureLoader, this.terrainConfig.terrain?.textures?.normal ?? '/assets/textures/terrain_normal.png'),
      this.loadTexture(textureLoader, this.terrainConfig.terrain?.textures?.roughness ?? '/assets/textures/terrain_roughness.png')
    ]);

    // Configure texture tiling
    const tiling = this.terrainConfig.terrain?.tiling ?? new Vector2(1, 1);
    [diffuseMap, normalMap, roughnessMap].forEach(texture => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;
      texture.repeat.copy(tiling);
    });

    // Store textures
    this.resources.textures.set('diffuse', diffuseMap);
    this.resources.textures.set('normal', normalMap);
    this.resources.textures.set('roughness', roughnessMap);

    // Create materials
    this.resources.materials.set('terrain', new ShaderMaterial({
      uniforms: {
        heightMap: { value: null },
        diffuseMap: { value: diffuseMap },
        normalMap: { value: normalMap },
        roughnessMap: { value: roughnessMap },
        tiling: { value: tiling },
        heightScale: { value: this.terrainConfig.terrain?.heightScale ?? 10 },
        minHeight: { value: this.terrainConfig.terrain?.minHeight ?? 0 },
        maxHeight: { value: this.terrainConfig.terrain?.maxHeight ?? 100 },
        lowColor: { value: new Color(0x2d4c1e) },
        highColor: { value: new Color(0x6b8e23) }
      },
      vertexShader: TerrainLayer.terrainShader.vertexShader,
      fragmentShader: TerrainLayer.terrainShader.fragmentShader
    }));

    this.resources.materials.set('water', new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new Color(this.terrainConfig.water?.color ?? 0x0077be) },
        opacity: { value: this.terrainConfig.water?.opacity ?? 0.8 },
        waveHeight: { value: this.terrainConfig.water?.waveHeight ?? 0.5 },
        waveFrequency: { value: this.terrainConfig.water?.waveFrequency ?? 1 }
      },
      vertexShader: TerrainLayer.waterShader.vertexShader,
      fragmentShader: TerrainLayer.waterShader.fragmentShader,
      transparent: true
    }));

    // Create terrain
    await this.createTerrain();

    // Create water
    if (this.terrainConfig.water) {
      await this.createWater();
    }

    // Create vegetation
    if (this.terrainConfig.vegetation) {
      for (const veg of this.terrainConfig.vegetation) {
        await this.createVegetation(veg);
      }
    }

    // Setup lighting
    this.setupLighting();
  }

  protected async setup(): Promise<void> {
    // Additional setup if needed
  }

  protected updateLayer(deltaTime: number): void {
    // Update water
    if (this.waterMesh) {
      const material = this.waterMesh.material as ShaderMaterial;
      material.uniforms.time.value += deltaTime;
    }

    // Update vegetation
    this.vegetation.forEach((instances, type) => {
      this.updateVegetation(instances, deltaTime);
    });
  }

  /**
   * Load a texture
   */
  private loadTexture(loader: TextureLoader, url: string): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  /**
   * Create terrain geometry
   */
  private async createTerrain(): Promise<void> {
    const size = this.terrainConfig.terrain?.size ?? new Vector2(100, 100);
    const segments = this.terrainConfig.terrain?.segments ?? new Vector2(100, 100);
    const heightScale = this.terrainConfig.terrain?.heightScale ?? 10;

    // Create geometry
    const geometry = new PlaneGeometry(
      size.x,
      size.y,
      segments.x,
      segments.y
    );

    // Generate height data
    this.heightData = new Float32Array((segments.x + 1) * (segments.y + 1));
    this.generateTerrain();

    // Update vertices
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] = this.heightData[i / 3] * heightScale;
    }

    // Update normals
    geometry.computeVertexNormals();

    // Create mesh
    const material = this.resources.materials.get('terrain')!;
    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;

    // Add to root
    this.root.add(mesh);
  }

  /**
   * Generate terrain height data
   */
  private generateTerrain(): void {
    const segments = this.terrainConfig.terrain?.segments ?? new Vector2(100, 100);
    const roughness = this.terrainConfig.terrain?.roughness ?? 1;

    for (let y = 0; y <= segments.y; y++) {
      for (let x = 0; x <= segments.x; x++) {
        const i = y * (segments.x + 1) + x;
        
        // Multiple octaves of noise
        let height = 0;
        let frequency = 1;
        let amplitude = 1;
        
        for (let o = 0; o < 4; o++) {
          const nx = x / segments.x * frequency * roughness;
          const ny = y / segments.y * frequency * roughness;
          height += this.noise.noise2D(nx, ny) * amplitude;
          
          frequency *= 2;
          amplitude *= 0.5;
        }

        // Normalize height
        height = (height + 1) / 2;
        this.heightData[i] = height;
      }
    }
  }

  /**
   * Create water plane
   */
  private async createWater(): Promise<void> {
    const size = this.terrainConfig.terrain?.size ?? new Vector2(100, 100);
    const geometry = new PlaneGeometry(size.x, size.y, 32, 32);
    const material = this.resources.materials.get('water')!;

    this.waterMesh = new Mesh(geometry, material);
    this.waterMesh.rotation.x = -Math.PI / 2;
    this.waterMesh.position.y = this.terrainConfig.water?.level ?? 0;

    this.root.add(this.waterMesh);
  }

  /**
   * Create vegetation instances
   */
  private async createVegetation(config: Vegetation): Promise<void> {
    const size = this.terrainConfig.terrain?.size ?? new Vector2(100, 100);
    const density = config.density ?? 0.1;
    const count = Math.floor(size.x * size.y * density);

    // Create base geometry based on type
    let geometry: BufferGeometry;
    switch (config.type) {
      case 'grass':
        geometry = this.createGrassGeometry();
        break;
      case 'tree':
        geometry = this.createTreeGeometry();
        break;
      case 'rock':
        geometry = this.createRockGeometry();
        break;
      default:
        geometry = this.createCustomGeometry(config);
    }

    // Create instanced mesh
    const material = new MeshPhongMaterial({
      color: config.color ?? 0x00ff00
    });
    const instances = new InstancedMesh(geometry, material, count);
    instances.instanceMatrix.setUsage(DynamicDrawUsage);

    // Position instances
    const matrix = new Matrix4();
    const position = new Vector3();
    const scale = new Vector3();
    const rotation = new Vector3();

    for (let i = 0; i < count; i++) {
      // Random position
      position.set(
        (Math.random() - 0.5) * size.x,
        0,
        (Math.random() - 0.5) * size.y
      );

      // Get height at position
      position.y = this.getHeightAt(position.x, position.z);

      // Random scale and rotation
      const s = (Math.random() * 0.5 + 0.5) * (config.randomness ?? 0.2);
      scale.set(s, s, s).multiply(config.scale ?? new Vector3(1, 1, 1));
      rotation.set(
        0,
        Math.random() * Math.PI * 2,
        0
      );

      // Set matrix
      matrix.compose(
        position,
        rotation.setFromVector3(rotation),
        scale
      );
      instances.setMatrixAt(i, matrix);
    }

    instances.instanceMatrix.needsUpdate = true;

    // Store instances
    this.vegetation.set(config.type, instances);
    this.root.add(instances);
  }

  /**
   * Create grass geometry
   */
  private createGrassGeometry(): BufferGeometry {
    // Simple grass blade geometry
    return new BufferGeometry(); // Placeholder
  }

  /**
   * Create tree geometry
   */
  private createTreeGeometry(): BufferGeometry {
    // Simple tree geometry
    return new BufferGeometry(); // Placeholder
  }

  /**
   * Create rock geometry
   */
  private createRockGeometry(): BufferGeometry {
    // Simple rock geometry
    return new BufferGeometry(); // Placeholder
  }

  /**
   * Create custom geometry
   */
  private createCustomGeometry(config: Vegetation): BufferGeometry {
    // Custom geometry based on config
    return new BufferGeometry(); // Placeholder
  }

  /**
   * Setup lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambient = new AmbientLight(
      this.terrainConfig.lighting?.ambient?.color ?? 0x404040,
      this.terrainConfig.lighting?.ambient?.intensity ?? 0.5
    );
    this.root.add(ambient);

    // Sun light
    const sun = new DirectionalLight(
      this.terrainConfig.lighting?.sun?.color ?? 0xffffff,
      this.terrainConfig.lighting?.sun?.intensity ?? 1
    );
    sun.position.copy(this.terrainConfig.lighting?.sun?.position ?? new Vector3(100, 100, 0));
    sun.target.position.set(0, 0, 0);
    this.root.add(sun);
    this.root.add(sun.target);
  }

  /**
   * Get height at position
   */
  private getHeightAt(x: number, z: number): number {
    const size = this.terrainConfig.terrain?.size ?? new Vector2(100, 100);
    const segments = this.terrainConfig.terrain?.segments ?? new Vector2(100, 100);
    const heightScale = this.terrainConfig.terrain?.heightScale ?? 10;

    // Convert world position to grid coordinates
    const gx = ((x + size.x / 2) / size.x) * segments.x;
    const gz = ((z + size.y / 2) / size.y) * segments.y;

    // Get grid cell
    const ix = Math.floor(gx);
    const iz = Math.floor(gz);

    // Get heights at cell corners
    const h00 = this.heightData[iz * (segments.x + 1) + ix] ?? 0;
    const h10 = this.heightData[iz * (segments.x + 1) + (ix + 1)] ?? 0;
    const h01 = this.heightData[(iz + 1) * (segments.x + 1) + ix] ?? 0;
    const h11 = this.heightData[(iz + 1) * (segments.x + 1) + (ix + 1)] ?? 0;

    // Interpolate
    const fx = gx - ix;
    const fz = gz - iz;

    const h0 = h00 * (1 - fx) + h10 * fx;
    const h1 = h01 * (1 - fx) + h11 * fx;

    return (h0 * (1 - fz) + h1 * fz) * heightScale;
  }

  /**
   * Update vegetation
   */
  private updateVegetation(instances: InstancedMesh, deltaTime: number): void {
    // Add wind effect or other animations
  }

  // Public API methods...
  // (Add methods for modifying terrain, water, and vegetation)
}