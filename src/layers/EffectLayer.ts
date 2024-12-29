import { Layer, LayerConfig } from '@/core/layers/Layer';
import {
  Object3D,
  ShaderMaterial,
  Mesh,
  PlaneGeometry,
  Vector3,
  Color,
  AdditiveBlending,
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  TextureLoader,
  Sprite,
  SpriteMaterial,
  InstancedMesh,
  Matrix4,
  DynamicDrawUsage
} from 'three';

interface EffectInstance {
  position: Vector3;
  scale: Vector3;
  rotation: Vector3;
  color: Color;
  opacity: number;
  lifetime: number;
  speed: number;
  age: number;
}

interface Effect {
  id: string;
  type: 'particles' | 'trail' | 'explosion' | 'lightning' | 'portal' | 'custom';
  position?: Vector3;
  color?: number;
  size?: number;
  duration?: number;
  intensity?: number;
  speed?: number;
  count?: number;
  metadata?: Record<string, any>;
}

interface EffectLayerConfig extends LayerConfig {
  maxEffects?: number;
  maxParticles?: number;
  defaultDuration?: number;
  defaultIntensity?: number;
  blending?: boolean;
  postProcessing?: boolean;
}

/**
 * Layer for visual effects
 */
export class EffectLayer extends Layer {
  private readonly effectConfig: EffectLayerConfig;
  private effects: Map<string, Object3D>;
  private instances: Map<string, EffectInstance[]>;
  private particleSystems: Map<string, Points>;

  // Shaders
  private static readonly particleShader = {
    vertexShader: \`
      attribute float size;
      attribute vec3 color;
      attribute float opacity;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vColor = color;
        vOpacity = opacity;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    \`,
    fragmentShader: \`
      uniform sampler2D texture;
      varying vec3 vColor;
      varying float vOpacity;
      void main() {
        vec4 texColor = texture2D(texture, gl_PointCoord);
        gl_FragColor = vec4(vColor, texColor.a * vOpacity);
      }
    \`
  };

  private static readonly trailShader = {
    vertexShader: \`
      attribute float progress;
      varying float vProgress;
      varying vec2 vUv;
      void main() {
        vProgress = progress;
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    \`,
    fragmentShader: \`
      uniform vec3 color;
      uniform float time;
      varying float vProgress;
      varying vec2 vUv;
      void main() {
        float alpha = smoothstep(0.0, 0.1, vUv.x) * smoothstep(1.0, 0.9, vUv.x);
        alpha *= sin(vProgress * 3.14159);
        gl_FragColor = vec4(color, alpha);
      }
    \`
  };

  constructor(config: EffectLayerConfig) {
    super(config);
    this.effectConfig = {
      maxEffects: config.maxEffects ?? 1000,
      maxParticles: config.maxParticles ?? 10000,
      defaultDuration: config.defaultDuration ?? 2,
      defaultIntensity: config.defaultIntensity ?? 1,
      blending: config.blending ?? true,
      postProcessing: config.postProcessing ?? false
    };
    this.effects = new Map();
    this.instances = new Map();
    this.particleSystems = new Map();
  }

  protected async loadResources(): Promise<void> {
    // Load textures
    const textureLoader = new TextureLoader();
    const particleTexture = await new Promise<THREE.Texture>((resolve, reject) => {
      textureLoader.load(
        '/assets/textures/particle.png',
        resolve,
        undefined,
        reject
      );
    });
    this.resources.textures.set('particle', particleTexture);

    // Create materials
    this.resources.materials.set('particle', new ShaderMaterial({
      uniforms: {
        texture: { value: particleTexture },
        time: { value: 0 }
      },
      vertexShader: EffectLayer.particleShader.vertexShader,
      fragmentShader: EffectLayer.particleShader.fragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false
    }));

    this.resources.materials.set('trail', new ShaderMaterial({
      uniforms: {
        color: { value: new Color(0xffffff) },
        time: { value: 0 }
      },
      vertexShader: EffectLayer.trailShader.vertexShader,
      fragmentShader: EffectLayer.trailShader.fragmentShader,
      transparent: true,
      blending: AdditiveBlending,
      depthWrite: false
    }));
  }

  protected async setup(): Promise<void> {
    // Additional setup if needed
  }

  protected updateLayer(deltaTime: number): void {
    // Update effects
    this.effects.forEach((effect, id) => {
      this.updateEffect(effect, deltaTime);
    });

    // Update instances
    this.instances.forEach((instances, id) => {
      this.updateInstances(instances, deltaTime);
    });

    // Update materials
    this.updateMaterials(deltaTime);
  }

  /**
   * Create a particle effect
   */
  private createParticleEffect(config: Effect): Object3D {
    const count = config.count ?? 100;
    const geometry = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);

    const color = new Color(config.color ?? 0xffffff);
    const size = config.size ?? 1;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * size;
      positions[i3 + 1] = (Math.random() - 0.5) * size;
      positions[i3 + 2] = (Math.random() - 0.5) * size;

      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * size;
      opacities[i] = Math.random();
    }

    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('opacity', new Float32BufferAttribute(opacities, 1));

    const material = this.resources.materials.get('particle')!.clone();
    const points = new Points(geometry, material);

    if (config.position) {
      points.position.copy(config.position);
    }

    points.userData.config = config;
    points.userData.age = 0;

    return points;
  }

  /**
   * Create a trail effect
   */
  private createTrailEffect(config: Effect): Object3D {
    const length = config.size ?? 2;
    const width = config.size ?? 0.1;
    const segments = 32;

    const geometry = new PlaneGeometry(length, width, segments, 1);
    const progress = new Float32Array((segments + 1) * 2);

    for (let i = 0; i <= segments; i++) {
      const value = i / segments;
      progress[i * 2] = value;
      progress[i * 2 + 1] = value;
    }

    geometry.setAttribute('progress', new Float32BufferAttribute(progress, 1));

    const material = this.resources.materials.get('trail')!.clone();
    material.uniforms.color.value = new Color(config.color ?? 0xffffff);

    const mesh = new Mesh(geometry, material);
    mesh.userData.config = config;
    mesh.userData.age = 0;

    if (config.position) {
      mesh.position.copy(config.position);
    }

    return mesh;
  }

  /**
   * Create an explosion effect
   */
  private createExplosionEffect(config: Effect): Object3D {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create a lightning effect
   */
  private createLightningEffect(config: Effect): Object3D {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Create a portal effect
   */
  private createPortalEffect(config: Effect): Object3D {
    // Implementation
    return new Object3D(); // Placeholder
  }

  /**
   * Update an effect
   */
  private updateEffect(effect: Object3D, deltaTime: number): void {
    const config = effect.userData.config as Effect;
    effect.userData.age += deltaTime;

    const progress = effect.userData.age / (config.duration ?? this.effectConfig.defaultDuration);

    if (progress >= 1) {
      this.removeEffect(config.id);
      return;
    }

    if (effect instanceof Points) {
      this.updateParticleEffect(effect, progress);
    } else if (effect instanceof Mesh) {
      this.updateMeshEffect(effect, progress);
    }
  }

  /**
   * Update a particle effect
   */
  private updateParticleEffect(points: Points, progress: number): void {
    const positions = points.geometry.attributes.position.array as Float32Array;
    const opacities = points.geometry.attributes.opacity.array as Float32Array;
    const config = points.userData.config as Effect;

    for (let i = 0; i < positions.length; i += 3) {
      // Update particle position
      positions[i] += (Math.random() - 0.5) * (config.speed ?? 1) * 0.1;
      positions[i + 1] += (Math.random() - 0.5) * (config.speed ?? 1) * 0.1;
      positions[i + 2] += (Math.random() - 0.5) * (config.speed ?? 1) * 0.1;

      // Update particle opacity
      const idx = i / 3;
      opacities[idx] *= 0.99; // Fade out
    }

    points.geometry.attributes.position.needsUpdate = true;
    points.geometry.attributes.opacity.needsUpdate = true;
  }

  /**
   * Update a mesh effect
   */
  private updateMeshEffect(mesh: Mesh, progress: number): void {
    if (mesh.material instanceof ShaderMaterial) {
      mesh.material.uniforms.time.value = progress;
    }
  }

  /**
   * Update effect instances
   */
  private updateInstances(instances: EffectInstance[], deltaTime: number): void {
    instances.forEach((instance, index) => {
      instance.age += deltaTime;
      if (instance.age >= instance.lifetime) {
        instances.splice(index, 1);
      } else {
        // Update instance properties
        instance.position.add(
          new Vector3(0, instance.speed, 0).multiplyScalar(deltaTime)
        );
        instance.opacity *= 0.99;
      }
    });
  }

  /**
   * Update materials
   */
  private updateMaterials(deltaTime: number): void {
    this.resources.materials.forEach(material => {
      if (material instanceof ShaderMaterial && material.uniforms.time) {
        material.uniforms.time.value += deltaTime;
      }
    });
  }

  /**
   * Add effect
   */
  public async addEffect(config: Effect): Promise<Object3D> {
    if (this.effects.size >= this.effectConfig.maxEffects) {
      throw new Error('Maximum number of effects reached');
    }

    let effect: Object3D;

    switch (config.type) {
      case 'particles':
        effect = this.createParticleEffect(config);
        break;
      case 'trail':
        effect = this.createTrailEffect(config);
        break;
      case 'explosion':
        effect = this.createExplosionEffect(config);
        break;
      case 'lightning':
        effect = this.createLightningEffect(config);
        break;
      case 'portal':
        effect = this.createPortalEffect(config);
        break;
      default:
        throw new Error(\`Unknown effect type: \${config.type}\`);
    }

    this.effects.set(config.id, effect);
    this.root.add(effect);

    return effect;
  }

  /**
   * Remove effect
   */
  public removeEffect(id: string): void {
    const effect = this.effects.get(id);
    if (effect) {
      effect.removeFromParent();
      this.effects.delete(id);
      this.emit('effectRemoved', id);
    }
  }

  /**
   * Clear all effects
   */
  public clearEffects(): void {
    this.effects.forEach((effect, id) => {
      this.removeEffect(id);
    });
  }

  /**
   * Set effect properties
   */
  public setEffectProperties(id: string, properties: Partial<Effect>): void {
    const effect = this.effects.get(id);
    if (effect) {
      Object.assign(effect.userData.config, properties);
      this.emit('effectPropertiesChanged', { id, properties });
    }
  }
}