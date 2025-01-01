import * as THREE from 'three';
import { Layer } from '@/core/Layer';
import { EventEmitter } from '@/utils/EventEmitter';

interface TerrainConfig {
  resolution?: number;
  heightScale?: number;
  noiseScale?: number;
  wireframe?: boolean;
  color?: number;
  roughness?: number;
  metalness?: number;
}

export class TerrainLayer extends Layer {
  private terrain: THREE.Mesh | null = null;
  private config: Required<TerrainConfig>;

  constructor(scene: THREE.Scene, config: TerrainConfig = {}) {
    super(scene);

    this.config = {
      resolution: config.resolution ?? 128,
      heightScale: config.heightScale ?? 2,
      noiseScale: config.noiseScale ?? 0.1,
      wireframe: config.wireframe ?? false,
      color: config.color ?? 0x3b7d4e,
      roughness: config.roughness ?? 0.8,
      metalness: config.metalness ?? 0.2,
    };

    this.createTerrain();
  }

  private createTerrain(): void {
    // Create geometry
    const geometry = new THREE.PlaneGeometry(
      10,
      10,
      this.config.resolution,
      this.config.resolution
    );

    // Generate heightmap
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];
      vertices[i + 1] = this.generateHeight(x, z);
    }

    // Update normals
    geometry.computeVertexNormals();

    // Create material
    const material = new THREE.MeshStandardMaterial({
      color: this.config.color,
      roughness: this.config.roughness,
      metalness: this.config.metalness,
      wireframe: this.config.wireframe,
    });

    // Create mesh
    this.terrain = new THREE.Mesh(geometry, material);
    this.terrain.rotation.x = -Math.PI / 2;
    this.container.add(this.terrain);
  }

  private generateHeight(x: number, z: number): number {
    // Simple Perlin noise implementation
    const scale = this.config.noiseScale;
    const height = this.config.heightScale;

    const nx = x * scale;
    const nz = z * scale;

    return (
      Math.sin(nx) * Math.cos(nz) * height +
      Math.sin(nx * 2) * Math.cos(nz * 2) * height * 0.5 +
      Math.sin(nx * 4) * Math.cos(nz * 4) * height * 0.25
    );
  }

  public setWireframe(wireframe: boolean): void {
    if (this.terrain) {
      (this.terrain.material as THREE.MeshStandardMaterial).wireframe = wireframe;
    }
  }

  public setColor(color: number): void {
    if (this.terrain) {
      (this.terrain.material as THREE.MeshStandardMaterial).color.setHex(color);
    }
  }

  public setHeightScale(scale: number): void {
    this.config.heightScale = scale;
    this.createTerrain();
  }

  public setNoiseScale(scale: number): void {
    this.config.noiseScale = scale;
    this.createTerrain();
  }

  public setResolution(resolution: number): void {
    this.config.resolution = resolution;
    this.createTerrain();
  }

  public update(deltaTime: number): void {
    // Add any animation or update logic here
  }

  public dispose(): void {
    if (this.terrain) {
      this.terrain.geometry.dispose();
      (this.terrain.material as THREE.Material).dispose();
    }
    super.dispose();
  }
}
