import * as THREE from 'three';
import { Layer } from '@/core/Layer';
import { EventEmitter } from '@/utils/EventEmitter';

interface EffectConfig {
  type?: 'bloom' | 'glow' | 'trail' | 'spark';
  color?: number;
  intensity?: number;
  size?: number;
  count?: number;
  decay?: number;
  speed?: number;
}

export class EffectLayer extends Layer {
  private effects: THREE.Points[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.PointsMaterial[] = [];
  private velocities: Float32Array[] = [];
  private lifetimes: Float32Array[] = [];
  private config: Required<EffectConfig>;

  constructor(scene: THREE.Scene, config: EffectConfig = {}) {
    super(scene);

    this.config = {
      type: config.type ?? 'bloom',
      color: config.color ?? 0x00ff00,
      intensity: config.intensity ?? 1,
      size: config.size ?? 0.1,
      count: config.count ?? 100,
      decay: config.decay ?? 0.98,
      speed: config.speed ?? 1,
    };

    this.createEffect();
  }

  private createEffect(): void {
    switch (this.config.type) {
      case 'bloom':
        this.createBloomEffect();
        break;
      case 'glow':
        this.createGlowEffect();
        break;
      case 'trail':
        this.createTrailEffect();
        break;
      case 'spark':
        this.createSparkEffect();
        break;
    }
  }

  private createBloomEffect(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.count * 3);
    const velocities = new Float32Array(this.config.count * 3);
    const lifetimes = new Float32Array(this.config.count);

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = 0;

      velocities[i3] = (Math.random() - 0.5) * 0.1 * this.config.speed;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.1 * this.config.speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.1 * this.config.speed;

      lifetimes[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: this.config.color,
      size: this.config.size,
      transparent: true,
      opacity: this.config.intensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.container.add(points);

    this.effects.push(points);
    this.geometries.push(geometry);
    this.materials.push(material);
    this.velocities.push(velocities);
    this.lifetimes.push(lifetimes);
  }

  private createGlowEffect(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.count * 3);
    const velocities = new Float32Array(this.config.count * 3);
    const lifetimes = new Float32Array(this.config.count);

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = Math.sin(angle) * radius;
      positions[i3 + 2] = 0;

      velocities[i3] = Math.cos(angle) * 0.05 * this.config.speed;
      velocities[i3 + 1] = Math.sin(angle) * 0.05 * this.config.speed;
      velocities[i3 + 2] = 0;

      lifetimes[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: this.config.color,
      size: this.config.size * 2,
      transparent: true,
      opacity: this.config.intensity * 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      map: this.createGlowTexture(),
    });

    const points = new THREE.Points(geometry, material);
    this.container.add(points);

    this.effects.push(points);
    this.geometries.push(geometry);
    this.materials.push(material);
    this.velocities.push(velocities);
    this.lifetimes.push(lifetimes);
  }

  private createTrailEffect(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.count * 3);
    const velocities = new Float32Array(this.config.count * 3);
    const lifetimes = new Float32Array(this.config.count);

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      velocities[i3] = (Math.random() - 0.5) * this.config.speed;
      velocities[i3 + 1] = Math.random() * this.config.speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * this.config.speed;

      lifetimes[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: this.config.color,
      size: this.config.size,
      transparent: true,
      opacity: this.config.intensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.container.add(points);

    this.effects.push(points);
    this.geometries.push(geometry);
    this.materials.push(material);
    this.velocities.push(velocities);
    this.lifetimes.push(lifetimes);
  }

  private createSparkEffect(): void {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.config.count * 3);
    const velocities = new Float32Array(this.config.count * 3);
    const lifetimes = new Float32Array(this.config.count);

    for (let i = 0; i < this.config.count; i++) {
      const i3 = i * 3;
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = 0;

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * this.config.speed;
      velocities[i3] = Math.cos(angle) * speed;
      velocities[i3 + 1] = Math.sin(angle) * speed;
      velocities[i3 + 2] = (Math.random() - 0.5) * speed;

      lifetimes[i] = 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: this.config.color,
      size: this.config.size,
      transparent: true,
      opacity: this.config.intensity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    this.container.add(points);

    this.effects.push(points);
    this.geometries.push(geometry);
    this.materials.push(material);
    this.velocities.push(velocities);
    this.lifetimes.push(lifetimes);
  }

  private createGlowTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  public setType(type: 'bloom' | 'glow' | 'trail' | 'spark'): void {
    this.config.type = type;
    this.dispose();
    this.createEffect();
  }

  public setColor(color: number): void {
    this.config.color = color;
    this.materials.forEach((material) => {
      material.color.setHex(color);
    });
  }

  public setIntensity(intensity: number): void {
    this.config.intensity = intensity;
    this.materials.forEach((material) => {
      material.opacity = intensity;
    });
  }

  public update(deltaTime: number): void {
    for (let e = 0; e < this.effects.length; e++) {
      const positions = this.geometries[e].attributes.position.array as Float32Array;
      const velocities = this.velocities[e];
      const lifetimes = this.lifetimes[e];

      for (let i = 0; i < this.config.count; i++) {
        const i3 = i * 3;

        // Update positions
        positions[i3] += velocities[i3] * deltaTime;
        positions[i3 + 1] += velocities[i3 + 1] * deltaTime;
        positions[i3 + 2] += velocities[i3 + 2] * deltaTime;

        // Update lifetimes
        lifetimes[i] *= this.config.decay;

        // Reset particles
        if (lifetimes[i] < 0.01) {
          switch (this.config.type) {
            case 'bloom':
              const angle = Math.random() * Math.PI * 2;
              const radius = Math.random() * 2;
              positions[i3] = Math.cos(angle) * radius;
              positions[i3 + 1] = Math.sin(angle) * radius;
              positions[i3 + 2] = 0;
              break;

            case 'glow':
              const glowAngle = Math.random() * Math.PI * 2;
              const glowRadius = Math.random() * 2;
              positions[i3] = Math.cos(glowAngle) * glowRadius;
              positions[i3 + 1] = Math.sin(glowAngle) * glowRadius;
              positions[i3 + 2] = 0;
              break;

            case 'trail':
            case 'spark':
              positions[i3] = 0;
              positions[i3 + 1] = 0;
              positions[i3 + 2] = 0;
              break;
          }

          lifetimes[i] = 1;
        }
      }

      this.geometries[e].attributes.position.needsUpdate = true;
    }
  }

  public dispose(): void {
    this.effects.forEach((effect) => {
      effect.geometry.dispose();
      (effect.material as THREE.Material).dispose();
      if ((effect.material as THREE.PointsMaterial).map) {
        (effect.material as THREE.PointsMaterial).map.dispose();
      }
      this.container.remove(effect);
    });

    this.effects = [];
    this.geometries = [];
    this.materials = [];
    this.velocities = [];
    this.lifetimes = [];
  }
}
