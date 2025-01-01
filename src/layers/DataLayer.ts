import * as THREE from 'three';
import { Layer } from '@/core/Layer';
import { EventEmitter } from '@/utils/EventEmitter';

interface DataPoint {
  id: string;
  position: THREE.Vector3;
  value: number;
  type: string;
  metadata?: Record<string, any>;
}

interface DataConnection {
  id: string;
  source: string;
  target: string;
  value: number;
  type: string;
  metadata?: Record<string, any>;
}

interface DataConfig {
  pointSize?: number;
  pointColor?: number;
  lineColor?: number;
  lineWidth?: number;
  showLabels?: boolean;
  labelSize?: number;
  labelColor?: string;
  animationSpeed?: number;
  glowIntensity?: number;
  highlightColor?: number;
}

export class DataLayer extends Layer {
  private config: Required<DataConfig>;
  private points: Map<string, THREE.Mesh> = new Map();
  private connections: Map<string, THREE.Line> = new Map();
  private labels: Map<string, THREE.Sprite> = new Map();
  private glowMaterial: THREE.ShaderMaterial;
  private highlightedPoints: Set<string> = new Set();
  private highlightedConnections: Set<string> = new Set();
  private animationTime: number = 0;

  constructor(scene: THREE.Scene, config: DataConfig = {}) {
    super(scene);

    this.config = {
      pointSize: config.pointSize ?? 0.1,
      pointColor: config.pointColor ?? 0x00ff00,
      lineColor: config.lineColor ?? 0x00ff00,
      lineWidth: config.lineWidth ?? 1,
      showLabels: config.showLabels ?? true,
      labelSize: config.labelSize ?? 0.1,
      labelColor: config.labelColor ?? '#ffffff',
      animationSpeed: config.animationSpeed ?? 1,
      glowIntensity: config.glowIntensity ?? 0.5,
      highlightColor: config.highlightColor ?? 0xffff00,
    };

    this.glowMaterial = this.createGlowMaterial();
  }

  private createGlowMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(this.config.pointColor) },
        intensity: { value: this.config.glowIntensity },
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        uniform float intensity;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float glow = pow(intensity * (1.0 + 0.2 * sin(time * 2.0)), 2.0);
          float rim = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
          gl_FragColor = vec4(glowColor, rim * glow);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.FrontSide,
    });
  }

  public addPoint(point: DataPoint): void {
    // Create point geometry
    const geometry = new THREE.SphereGeometry(this.config.pointSize);
    const material = new THREE.MeshPhongMaterial({
      color: this.config.pointColor,
      emissive: this.config.pointColor,
      emissiveIntensity: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(point.position);
    mesh.userData = { ...point };

    // Add glow effect
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.config.pointSize * 1.5),
      this.glowMaterial.clone()
    );
    mesh.add(glowMesh);

    // Add label if enabled
    if (this.config.showLabels) {
      const label = this.createLabel(point.id, point.position);
      this.labels.set(point.id, label);
      this.container.add(label);
    }

    this.points.set(point.id, mesh);
    this.container.add(mesh);
  }

  public addConnection(connection: DataConnection): void {
    const sourcePoint = this.points.get(connection.source);
    const targetPoint = this.points.get(connection.target);

    if (!sourcePoint || !targetPoint) {
      console.warn(`Cannot create connection: points not found`);
      return;
    }

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array([
      sourcePoint.position.x, sourcePoint.position.y, sourcePoint.position.z,
      targetPoint.position.x, targetPoint.position.y, targetPoint.position.z,
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({
      color: this.config.lineColor,
      linewidth: this.config.lineWidth,
      transparent: true,
      opacity: 0.6,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { ...connection };

    this.connections.set(connection.id, line);
    this.container.add(line);
  }

  private createLabel(text: string, position: THREE.Vector3): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = '48px Arial';
    context.fillStyle = this.config.labelColor;
    context.fillText(text, 0, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.y += this.config.pointSize * 2;
    sprite.scale.set(this.config.labelSize, this.config.labelSize, 1);

    return sprite;
  }

  public highlightPoint(id: string, highlight: boolean = true): void {
    const point = this.points.get(id);
    if (!point) return;

    if (highlight) {
      this.highlightedPoints.add(id);
      (point.material as THREE.MeshPhongMaterial).emissive.setHex(this.config.highlightColor);
      (point.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.5;
    } else {
      this.highlightedPoints.delete(id);
      (point.material as THREE.MeshPhongMaterial).emissive.setHex(this.config.pointColor);
      (point.material as THREE.MeshPhongMaterial).emissiveIntensity = 0.2;
    }
  }

  public highlightConnection(id: string, highlight: boolean = true): void {
    const connection = this.connections.get(id);
    if (!connection) return;

    if (highlight) {
      this.highlightedConnections.add(id);
      (connection.material as THREE.LineBasicMaterial).color.setHex(this.config.highlightColor);
      (connection.material as THREE.LineBasicMaterial).opacity = 1;
    } else {
      this.highlightedConnections.delete(id);
      (connection.material as THREE.LineBasicMaterial).color.setHex(this.config.lineColor);
      (connection.material as THREE.LineBasicMaterial).opacity = 0.6;
    }
  }

  public updatePointPosition(id: string, position: THREE.Vector3): void {
    const point = this.points.get(id);
    const label = this.labels.get(id);
    if (!point) return;

    point.position.copy(position);
    if (label) {
      label.position.copy(position);
      label.position.y += this.config.pointSize * 2;
    }

    // Update connected lines
    this.connections.forEach((line) => {
      const { source, target } = line.userData;
      if (source === id || target === id) {
        const positions = line.geometry.attributes.position.array as Float32Array;
        const sourcePoint = this.points.get(source);
        const targetPoint = this.points.get(target);

        if (sourcePoint && targetPoint) {
          positions[0] = sourcePoint.position.x;
          positions[1] = sourcePoint.position.y;
          positions[2] = sourcePoint.position.z;
          positions[3] = targetPoint.position.x;
          positions[4] = targetPoint.position.y;
          positions[5] = targetPoint.position.z;
          line.geometry.attributes.position.needsUpdate = true;
        }
      }
    });
  }

  public setPointValue(id: string, value: number): void {
    const point = this.points.get(id);
    if (!point) return;

    point.userData.value = value;
    const scale = 0.5 + value * 0.5;
    point.scale.setScalar(scale);
  }

  public setConnectionValue(id: string, value: number): void {
    const connection = this.connections.get(id);
    if (!connection) return;

    connection.userData.value = value;
    (connection.material as THREE.LineBasicMaterial).opacity = 0.2 + value * 0.8;
  }

  public update(deltaTime: number): void {
    this.animationTime += deltaTime * this.config.animationSpeed;

    // Update glow effect
    this.points.forEach((point) => {
      point.children.forEach((child) => {
        if (child.material instanceof THREE.ShaderMaterial) {
          child.material.uniforms.time.value = this.animationTime;
        }
      });
    });

    // Update labels to face camera
    if (this.config.showLabels) {
      const cameraPosition = this.scene.getObjectByName('camera')?.position;
      if (cameraPosition) {
        this.labels.forEach((label) => {
          label.lookAt(cameraPosition);
        });
      }
    }
  }

  public dispose(): void {
    // Dispose points
    this.points.forEach((point) => {
      point.geometry.dispose();
      (point.material as THREE.Material).dispose();
      point.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (child.material as THREE.Material).dispose();
        }
      });
    });

    // Dispose connections
    this.connections.forEach((connection) => {
      connection.geometry.dispose();
      (connection.material as THREE.Material).dispose();
    });

    // Dispose labels
    this.labels.forEach((label) => {
      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.Material).dispose();
    });

    this.points.clear();
    this.connections.clear();
    this.labels.clear();
    this.highlightedPoints.clear();
    this.highlightedConnections.clear();

    super.dispose();
  }
}
