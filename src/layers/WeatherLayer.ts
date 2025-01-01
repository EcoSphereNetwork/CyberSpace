import * as THREE from 'three';
import { Layer } from '@/core/Layer';
import { EventEmitter } from '@/utils/EventEmitter';

interface WeatherConfig {
  particleCount?: number;
  particleSize?: number;
  particleColor?: number;
  particleOpacity?: number;
  windSpeed?: number;
  windDirection?: THREE.Vector3;
  type?: 'rain' | 'snow' | 'fog';
}

export class WeatherLayer extends Layer {
  private particles: THREE.Points | null = null;
  private particleSystem: THREE.BufferGeometry | null = null;
  private config: Required<WeatherConfig>;
  private velocities: Float32Array;

  constructor(scene: THREE.Scene, config: WeatherConfig = {}) {
    super(scene);

    this.config = {
      particleCount: config.particleCount ?? 1000,
      particleSize: config.particleSize ?? 0.1,
      particleColor: config.particleColor ?? 0xffffff,
      particleOpacity: config.particleOpacity ?? 0.6,
      windSpeed: config.windSpeed ?? 1,
      windDirection: config.windDirection ?? new THREE.Vector3(1, -1, 0).normalize(),
      type: config.type ?? 'rain',
    };

    this.velocities = new Float32Array(this.config.particleCount * 3);
    this.createParticleSystem();
  }

  private createParticleSystem(): void {
    // Create geometry
    this.particleSystem = new THREE.BufferGeometry();

    // Create positions
    const positions = new Float32Array(this.config.particleCount * 3);
    for (let i = 0; i < this.config.particleCount * 3; i += 3) {
      positions[i] = Math.random() * 20 - 10; // x
      positions[i + 1] = Math.random() * 20; // y
      positions[i + 2] = Math.random() * 20 - 10; // z

      // Initialize velocities
      this.velocities[i] = this.config.windDirection.x * this.config.windSpeed;
      this.velocities[i + 1] = this.config.windDirection.y * this.config.windSpeed;
      this.velocities[i + 2] = this.config.windDirection.z * this.config.windSpeed;

      // Add random variation to velocities
      this.velocities[i] += (Math.random() - 0.5) * 0.2;
      this.velocities[i + 1] += (Math.random() - 0.5) * 0.2;
      this.velocities[i + 2] += (Math.random() - 0.5) * 0.2;
    }

    this.particleSystem.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    );

    // Create material based on weather type
    let material: THREE.PointsMaterial;
    switch (this.config.type) {
      case 'snow':
        material = new THREE.PointsMaterial({
          color: this.config.particleColor,
          size: this.config.particleSize,
          opacity: this.config.particleOpacity,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          map: this.createSnowflakeTexture(),
        });
        break;

      case 'fog':
        material = new THREE.PointsMaterial({
          color: this.config.particleColor,
          size: this.config.particleSize * 3,
          opacity: this.config.particleOpacity * 0.5,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          map: this.createFogTexture(),
        });
        break;

      case 'rain':
      default:
        material = new THREE.PointsMaterial({
          color: this.config.particleColor,
          size: this.config.particleSize,
          opacity: this.config.particleOpacity,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        break;
    }

    // Create points
    this.particles = new THREE.Points(this.particleSystem, material);
    this.container.add(this.particles);
  }

  private createSnowflakeTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Draw snowflake
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(16, 16, 8, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  private createFogTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Create radial gradient
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  public setWindSpeed(speed: number): void {
    this.config.windSpeed = speed;
    for (let i = 0; i < this.velocities.length; i += 3) {
      this.velocities[i] = this.config.windDirection.x * speed + (Math.random() - 0.5) * 0.2;
      this.velocities[i + 1] = this.config.windDirection.y * speed + (Math.random() - 0.5) * 0.2;
      this.velocities[i + 2] = this.config.windDirection.z * speed + (Math.random() - 0.5) * 0.2;
    }
  }

  public setWindDirection(direction: THREE.Vector3): void {
    this.config.windDirection.copy(direction.normalize());
    this.setWindSpeed(this.config.windSpeed);
  }

  public setParticleCount(count: number): void {
    this.config.particleCount = count;
    this.velocities = new Float32Array(count * 3);
    this.createParticleSystem();
  }

  public setType(type: 'rain' | 'snow' | 'fog'): void {
    this.config.type = type;
    this.createParticleSystem();
  }

  public update(deltaTime: number): void {
    if (!this.particleSystem || !this.particles) return;

    const positions = this.particleSystem.attributes.position.array as Float32Array;
    for (let i = 0; i < positions.length; i += 3) {
      // Update positions
      positions[i] += this.velocities[i] * deltaTime;
      positions[i + 1] += this.velocities[i + 1] * deltaTime;
      positions[i + 2] += this.velocities[i + 2] * deltaTime;

      // Reset particles that go out of bounds
      if (positions[i + 1] < 0) {
        positions[i] = Math.random() * 20 - 10;
        positions[i + 1] = 20;
        positions[i + 2] = Math.random() * 20 - 10;
      }
    }

    this.particleSystem.attributes.position.needsUpdate = true;
  }

  public dispose(): void {
    if (this.particles) {
      this.particles.geometry.dispose();
      (this.particles.material as THREE.Material).dispose();
      if ((this.particles.material as THREE.PointsMaterial).map) {
        (this.particles.material as THREE.PointsMaterial).map.dispose();
      }
    }
    super.dispose();
  }
}
