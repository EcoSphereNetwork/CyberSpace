import { Layer, LayerConfig } from '@/core/layers/Layer';
import {
  Object3D,
  Vector3,
  Color,
  ShaderMaterial,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  Mesh,
  PlaneGeometry,
  AdditiveBlending,
  FogExp2,
  TextureLoader,
  RepeatWrapping,
  InstancedMesh,
  Matrix4,
  DynamicDrawUsage,
} from 'three';

interface WeatherParticle {
  position: Vector3;
  velocity: Vector3;
  size: number;
  lifetime: number;
  age: number;
}

interface WeatherEffect {
  type: 'rain' | 'snow' | 'fog' | 'clouds' | 'lightning' | 'custom';
  intensity?: number;
  color?: number;
  area?: {
    center: Vector3;
    size: Vector3;
  };
  speed?: number;
  metadata?: Record<string, any>;
}

interface WeatherLayerConfig extends LayerConfig {
  effects?: WeatherEffect[];
  maxParticles?: number;
  wind?: Vector3;
  ambient?: {
    color?: number;
    intensity?: number;
  };
  fog?: {
    color?: number;
    density?: number;
  };
}

/**
 * Layer for weather and environmental effects
 */
export class WeatherLayer extends Layer {
  private readonly weatherConfig: WeatherLayerConfig;
  private effects: Map<string, Object3D>;
  private particles: Map<string, WeatherParticle[]>;
  private wind: Vector3;

  // Shaders
  private static readonly rainShader = {
    vertexShader: `
      attribute float size;
      attribute float opacity;
      varying float vOpacity;
      void main() {
        vOpacity = opacity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D texture;
      varying float vOpacity;
      void main() {
        vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);
        vec4 tex = texture2D(texture, uv);
        gl_FragColor = vec4(vec3(0.7, 0.7, 0.9), tex.a * vOpacity);
      }
    `,
  };

  private static readonly snowShader = {
    vertexShader: `
      attribute float size;
      attribute float rotation;
      attribute float opacity;
      varying float vRotation;
      varying float vOpacity;
      void main() {
        vRotation = rotation;
        vOpacity = opacity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D texture;
      varying float vRotation;
      varying float vOpacity;
      void main() {
        vec2 center = vec2(0.5, 0.5);
        vec2 uv = gl_PointCoord - center;
        float c = cos(vRotation);
        float s = sin(vRotation);
        vec2 ruv = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c) + center;
        vec4 tex = texture2D(texture, ruv);
        gl_FragColor = vec4(vec3(1.0), tex.a * vOpacity);
      }
    `,
  };

  private static readonly cloudShader = {
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D noiseTexture;
      uniform float time;
      uniform vec3 color;
      uniform float density;
      varying vec2 vUv;
      void main() {
        vec2 uv = vUv + vec2(time * 0.01, 0.0);
        float noise = texture2D(noiseTexture, uv).r;
        noise += texture2D(noiseTexture, uv * 2.0).r * 0.5;
        noise = smoothstep(0.4, 0.6, noise);
        gl_FragColor = vec4(color, noise * density);
      }
    `,
  };

  constructor(config: WeatherLayerConfig) {
    super(config);
    this.weatherConfig = config;
    this.effects = new Map();
    this.particles = new Map();
    this.wind = config.wind ?? new Vector3(0, 0, 0);
  }

  protected async loadResources(): Promise<void> {
    // Load textures
    const textureLoader = new TextureLoader();
    const [rainTexture, snowTexture, noiseTexture] = await Promise.all([
      this.loadTexture(textureLoader, '/assets/textures/rain.png'),
      this.loadTexture(textureLoader, '/assets/textures/snow.png'),
      this.loadTexture(textureLoader, '/assets/textures/noise.png'),
    ]);

    noiseTexture.wrapS = RepeatWrapping;
    noiseTexture.wrapT = RepeatWrapping;

    this.resources.textures.set('rain', rainTexture);
    this.resources.textures.set('snow', snowTexture);
    this.resources.textures.set('noise', noiseTexture);

    // Create materials
    this.resources.materials.set(
      'rain',
      new ShaderMaterial({
        uniforms: {
          texture: { value: rainTexture },
        },
        vertexShader: WeatherLayer.rainShader.vertexShader,
        fragmentShader: WeatherLayer.rainShader.fragmentShader,
        transparent: true,
        depthWrite: false,
      })
    );

    this.resources.materials.set(
      'snow',
      new ShaderMaterial({
        uniforms: {
          texture: { value: snowTexture },
        },
        vertexShader: WeatherLayer.snowShader.vertexShader,
        fragmentShader: WeatherLayer.snowShader.fragmentShader,
        transparent: true,
        depthWrite: false,
      })
    );

    this.resources.materials.set(
      'cloud',
      new ShaderMaterial({
        uniforms: {
          noiseTexture: { value: noiseTexture },
          time: { value: 0 },
          color: { value: new Color(0xffffff) },
          density: { value: 0.5 },
        },
        vertexShader: WeatherLayer.cloudShader.vertexShader,
        fragmentShader: WeatherLayer.cloudShader.fragmentShader,
        transparent: true,
        depthWrite: false,
      })
    );

    // Setup fog
    if (this.weatherConfig.fog) {
      this.setupFog();
    }

    // Create initial effects
    if (this.weatherConfig.effects) {
      for (const effect of this.weatherConfig.effects) {
        await this.createWeatherEffect(effect);
      }
    }
  }

  protected async setup(): Promise<void> {
    // Additional setup if needed
  }

  protected updateLayer(deltaTime: number): void {
    // Update wind
    this.updateWind(deltaTime);

    // Update effects
    this.effects.forEach((effect, id) => {
      this.updateEffect(effect, deltaTime);
    });

    // Update particles
    this.particles.forEach((particles, id) => {
      this.updateParticles(particles, deltaTime);
    });

    // Update materials
    this.updateMaterials(deltaTime);
  }

  /**
   * Load a texture
   */
  private loadTexture(
    loader: TextureLoader,
    url: string
  ): Promise<THREE.Texture> {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  /**
   * Setup fog
   */
  private setupFog(): void {
    const scene = this.root.parent;
    if (scene) {
      scene.fog = new FogExp2(
        this.weatherConfig.fog?.color ?? 0xcccccc,
        this.weatherConfig.fog?.density ?? 0.005
      );
    }
  }

  /**
   * Create a weather effect
   */
  private async createWeatherEffect(config: WeatherEffect): Promise<Object3D> {
    let effect: Object3D;

    switch (config.type) {
      case 'rain':
        effect = await this.createRainEffect(config);
        break;
      case 'snow':
        effect = await this.createSnowEffect(config);
        break;
      case 'fog':
        effect = await this.createFogEffect(config);
        break;
      case 'clouds':
        effect = await this.createCloudEffect(config);
        break;
      case 'lightning':
        effect = await this.createLightningEffect(config);
        break;
      default:
        effect = await this.createCustomEffect(config);
    }

    // Store effect
    const id = `${config.type}_${this.effects.size}`;
    this.effects.set(id, effect);
    this.resources.objects.set(id, effect);

    // Add to root
    this.root.add(effect);

    return effect;
  }

  /**
   * Create rain effect
   */
  private async createRainEffect(config: WeatherEffect): Promise<Object3D> {
    const count = Math.floor((config.intensity ?? 1) * 1000);
    const area = config.area ?? {
      center: new Vector3(0, 20, 0),
      size: new Vector3(40, 0, 40),
    };

    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    const particles: WeatherParticle[] = [];

    for (let i = 0; i < count; i++) {
      const particle = this.createRainParticle(area);
      particles.push(particle);

      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      sizes[i] = particle.size;
      opacities[i] = 1;
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new Float32BufferAttribute(opacities, 1));

    const material = this.resources.materials.get('rain')!.clone();
    const points = new Points(geometry, material);

    // Store particles
    this.particles.set(points.uuid, particles);

    return points;
  }

  /**
   * Create snow effect
   */
  private async createSnowEffect(config: WeatherEffect): Promise<Object3D> {
    const count = Math.floor((config.intensity ?? 1) * 500);
    const area = config.area ?? {
      center: new Vector3(0, 20, 0),
      size: new Vector3(40, 0, 40),
    };

    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const rotations = new Float32Array(count);
    const opacities = new Float32Array(count);

    const particles: WeatherParticle[] = [];

    for (let i = 0; i < count; i++) {
      const particle = this.createSnowParticle(area);
      particles.push(particle);

      const i3 = i * 3;
      positions[i3] = particle.position.x;
      positions[i3 + 1] = particle.position.y;
      positions[i3 + 2] = particle.position.z;

      sizes[i] = particle.size;
      rotations[i] = Math.random() * Math.PI * 2;
      opacities[i] = 1;
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('rotation', new Float32BufferAttribute(rotations, 1));
    geometry.setAttribute('opacity', new Float32BufferAttribute(opacities, 1));

    const material = this.resources.materials.get('snow')!.clone();
    const points = new Points(geometry, material);

    // Store particles
    this.particles.set(points.uuid, particles);

    return points;
  }

  /**
   * Create fog effect
   */
  private async createFogEffect(config: WeatherEffect): Promise<Object3D> {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create cloud effect
   */
  private async createCloudEffect(config: WeatherEffect): Promise<Object3D> {
    const geometry = new PlaneGeometry(100, 100);
    const material = this.resources.materials.get('cloud')!.clone();
    material.uniforms.color.value = new Color(config.color ?? 0xffffff);
    material.uniforms.density.value = config.intensity ?? 0.5;

    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = 30;

    return mesh;
  }

  /**
   * Create lightning effect
   */
  private async createLightningEffect(
    config: WeatherEffect
  ): Promise<Object3D> {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create custom effect
   */
  private async createCustomEffect(config: WeatherEffect): Promise<Object3D> {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create a rain particle
   */
  private createRainParticle(area: {
    center: Vector3;
    size: Vector3;
  }): WeatherParticle {
    return {
      position: new Vector3(
        area.center.x + (Math.random() - 0.5) * area.size.x,
        area.center.y,
        area.center.z + (Math.random() - 0.5) * area.size.z
      ),
      velocity: new Vector3(0, -10, 0),
      size: Math.random() * 0.1 + 0.1,
      lifetime: Infinity,
      age: 0,
    };
  }

  /**
   * Create a snow particle
   */
  private createSnowParticle(area: {
    center: Vector3;
    size: Vector3;
  }): WeatherParticle {
    return {
      position: new Vector3(
        area.center.x + (Math.random() - 0.5) * area.size.x,
        area.center.y,
        area.center.z + (Math.random() - 0.5) * area.size.z
      ),
      velocity: new Vector3(Math.random() - 0.5, -2, Math.random() - 0.5),
      size: Math.random() * 0.2 + 0.2,
      lifetime: Infinity,
      age: 0,
    };
  }

  /**
   * Update wind
   */
  private updateWind(deltaTime: number): void {
    // Add wind variation
    const time = Date.now() * 0.001;
    this.wind.x = Math.sin(time * 0.3) * 0.5;
    this.wind.z = Math.cos(time * 0.5) * 0.5;
  }

  /**
   * Update effect
   */
  private updateEffect(effect: Object3D, deltaTime: number): void {
    if (effect.material instanceof ShaderMaterial) {
      if (effect.material.uniforms.time) {
        effect.material.uniforms.time.value += deltaTime;
      }
    }
  }

  /**
   * Update particles
   */
  private updateParticles(
    particles: WeatherParticle[],
    deltaTime: number
  ): void {
    particles.forEach((particle) => {
      // Apply wind
      particle.velocity.add(this.wind.clone().multiplyScalar(deltaTime));

      // Update position
      particle.position.add(
        particle.velocity.clone().multiplyScalar(deltaTime)
      );

      // Reset if out of bounds
      if (particle.position.y < -10) {
        particle.position.y = 20;
        particle.position.x += (Math.random() - 0.5) * 40;
        particle.position.z += (Math.random() - 0.5) * 40;
        particle.velocity.set(0, -10, 0);
      }
    });

    // Update geometry
    const points = this.root.getObjectByProperty(
      'uuid',
      particles[0].uuid
    ) as Points;
    if (points) {
      const positions = points.geometry.attributes.position
        .array as Float32Array;
      particles.forEach((particle, i) => {
        const i3 = i * 3;
        positions[i3] = particle.position.x;
        positions[i3 + 1] = particle.position.y;
        positions[i3 + 2] = particle.position.z;
      });
      points.geometry.attributes.position.needsUpdate = true;
    }
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

  // Public API methods...
  // (Add methods for controlling weather effects)
}
