import * as THREE from 'three';
import { Layer } from '@/core/Layer';
import { EventEmitter } from '@/utils/EventEmitter';

interface NetworkNode {
  id: string;
  type: 'server' | 'client' | 'router' | 'switch';
  position: THREE.Vector3;
  status: 'online' | 'offline' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

interface NetworkLink {
  id: string;
  source: string;
  target: string;
  type: 'fiber' | 'copper' | 'wireless';
  bandwidth: number;
  latency: number;
  status: 'active' | 'inactive' | 'congested' | 'failed';
  metadata?: Record<string, any>;
}

interface NetworkPacket {
  id: string;
  source: string;
  target: string;
  type: 'data' | 'control' | 'error';
  size: number;
  priority: number;
  path: string[];
  metadata?: Record<string, any>;
}

interface NetworkConfig {
  nodeSize?: number;
  linkWidth?: number;
  packetSize?: number;
  packetSpeed?: number;
  showLabels?: boolean;
  labelSize?: number;
  colors?: {
    server?: number;
    client?: number;
    router?: number;
    switch?: number;
    fiber?: number;
    copper?: number;
    wireless?: number;
    data?: number;
    control?: number;
    error?: number;
    online?: number;
    offline?: number;
    warning?: number;
    error?: number;
    active?: number;
    inactive?: number;
    congested?: number;
    failed?: number;
  };
}

export class NetworkLayer extends Layer {
  private config: Required<NetworkConfig>;
  private nodes: Map<string, THREE.Mesh> = new Map();
  private links: Map<string, THREE.Line> = new Map();
  private packets: Map<string, THREE.Mesh> = new Map();
  private labels: Map<string, THREE.Sprite> = new Map();
  private packetPaths: Map<string, number> = new Map();
  private animationTime: number = 0;

  constructor(scene: THREE.Scene, config: NetworkConfig = {}) {
    super(scene);

    this.config = {
      nodeSize: config.nodeSize ?? 0.5,
      linkWidth: config.linkWidth ?? 0.1,
      packetSize: config.packetSize ?? 0.2,
      packetSpeed: config.packetSpeed ?? 1,
      showLabels: config.showLabels ?? true,
      labelSize: config.labelSize ?? 0.5,
      colors: {
        server: config.colors?.server ?? 0x4caf50,
        client: config.colors?.client ?? 0x2196f3,
        router: config.colors?.router ?? 0x9c27b0,
        switch: config.colors?.switch ?? 0xff9800,
        fiber: config.colors?.fiber ?? 0x00ff00,
        copper: config.colors?.copper ?? 0xffeb3b,
        wireless: config.colors?.wireless ?? 0x03a9f4,
        data: config.colors?.data ?? 0x4caf50,
        control: config.colors?.control ?? 0xff9800,
        error: config.colors?.error ?? 0xf44336,
        online: config.colors?.online ?? 0x4caf50,
        offline: config.colors?.offline ?? 0x9e9e9e,
        warning: config.colors?.warning ?? 0xff9800,
        error: config.colors?.error ?? 0xf44336,
        active: config.colors?.active ?? 0x4caf50,
        inactive: config.colors?.inactive ?? 0x9e9e9e,
        congested: config.colors?.congested ?? 0xff9800,
        failed: config.colors?.failed ?? 0xf44336,
      },
    };
  }

  public addNode(node: NetworkNode): void {
    // Create node geometry based on type
    let geometry: THREE.BufferGeometry;
    switch (node.type) {
      case 'server':
        geometry = new THREE.BoxGeometry(
          this.config.nodeSize,
          this.config.nodeSize * 1.5,
          this.config.nodeSize
        );
        break;
      case 'client':
        geometry = new THREE.SphereGeometry(this.config.nodeSize * 0.75);
        break;
      case 'router':
        geometry = new THREE.CylinderGeometry(
          this.config.nodeSize * 0.5,
          this.config.nodeSize * 0.5,
          this.config.nodeSize,
          8
        );
        break;
      case 'switch':
        geometry = new THREE.OctahedronGeometry(this.config.nodeSize * 0.75);
        break;
    }

    // Create material based on status
    const material = new THREE.MeshPhongMaterial({
      color: this.config.colors[node.type],
      emissive: this.config.colors[node.status],
      emissiveIntensity: 0.5,
      shininess: 50,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(node.position);
    mesh.userData = { ...node };

    // Add label if enabled
    if (this.config.showLabels) {
      const label = this.createLabel(node.id, node.position);
      this.labels.set(node.id, label);
      this.container.add(label);
    }

    this.nodes.set(node.id, mesh);
    this.container.add(mesh);
  }

  public addLink(link: NetworkLink): void {
    const sourceNode = this.nodes.get(link.source);
    const targetNode = this.nodes.get(link.target);

    if (!sourceNode || !targetNode) {
      console.warn(`Cannot create link: nodes not found`);
      return;
    }

    // Create curve for the link
    const curve = new THREE.QuadraticBezierCurve3(
      sourceNode.position,
      new THREE.Vector3(
        (sourceNode.position.x + targetNode.position.x) / 2,
        (sourceNode.position.y + targetNode.position.y) / 2 + 1,
        (sourceNode.position.z + targetNode.position.z) / 2
      ),
      targetNode.position
    );

    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create material based on type and status
    const material = new THREE.LineBasicMaterial({
      color: this.config.colors[link.type],
      linewidth: this.config.linkWidth,
      transparent: true,
      opacity: link.status === 'active' ? 1 : 0.3,
    });

    const line = new THREE.Line(geometry, material);
    line.userData = { ...link, curve };

    this.links.set(link.id, line);
    this.container.add(line);
  }

  public sendPacket(packet: NetworkPacket): void {
    // Create packet geometry
    const geometry = new THREE.SphereGeometry(this.config.packetSize);
    const material = new THREE.MeshPhongMaterial({
      color: this.config.colors[packet.type],
      emissive: this.config.colors[packet.type],
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData = { ...packet, pathIndex: 0 };

    // Position at source
    const sourceNode = this.nodes.get(packet.source);
    if (sourceNode) {
      mesh.position.copy(sourceNode.position);
    }

    this.packets.set(packet.id, mesh);
    this.container.add(mesh);
    this.packetPaths.set(packet.id, 0);
  }

  private createLabel(text: string, position: THREE.Vector3): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = '48px Arial';
    context.fillStyle = '#ffffff';
    context.fillText(text, 0, 48);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.position.copy(position);
    sprite.position.y += this.config.nodeSize * 2;
    sprite.scale.set(this.config.labelSize, this.config.labelSize, 1);

    return sprite;
  }

  public updateNodeStatus(id: string, status: 'online' | 'offline' | 'warning' | 'error'): void {
    const node = this.nodes.get(id);
    if (!node) return;

    node.userData.status = status;
    (node.material as THREE.MeshPhongMaterial).emissive.setHex(this.config.colors[status]);
  }

  public updateLinkStatus(id: string, status: 'active' | 'inactive' | 'congested' | 'failed'): void {
    const link = this.links.get(id);
    if (!link) return;

    link.userData.status = status;
    (link.material as THREE.LineBasicMaterial).opacity = status === 'active' ? 1 : 0.3;
  }

  public update(deltaTime: number): void {
    this.animationTime += deltaTime;

    // Update packet positions
    this.packets.forEach((packet, id) => {
      const { path, pathIndex } = packet.userData;
      if (pathIndex >= path.length - 1) {
        // Packet reached destination
        this.container.remove(packet);
        this.packets.delete(id);
        this.packetPaths.delete(id);
        return;
      }

      const currentLink = this.links.get(`${path[pathIndex]}-${path[pathIndex + 1]}`);
      if (!currentLink) return;

      const curve = currentLink.userData.curve as THREE.QuadraticBezierCurve3;
      const progress = this.packetPaths.get(id)!;
      const newProgress = progress + deltaTime * this.config.packetSpeed;

      if (newProgress >= 1) {
        // Move to next link
        packet.userData.pathIndex++;
        this.packetPaths.set(id, 0);
      } else {
        // Update position along curve
        const position = curve.getPoint(newProgress);
        packet.position.copy(position);
        this.packetPaths.set(id, newProgress);
      }
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
    // Dispose nodes
    this.nodes.forEach((node) => {
      node.geometry.dispose();
      (node.material as THREE.Material).dispose();
    });

    // Dispose links
    this.links.forEach((link) => {
      link.geometry.dispose();
      (link.material as THREE.Material).dispose();
    });

    // Dispose packets
    this.packets.forEach((packet) => {
      packet.geometry.dispose();
      (packet.material as THREE.Material).dispose();
    });

    // Dispose labels
    this.labels.forEach((label) => {
      (label.material as THREE.SpriteMaterial).map?.dispose();
      (label.material as THREE.Material).dispose();
    });

    this.nodes.clear();
    this.links.clear();
    this.packets.clear();
    this.labels.clear();
    this.packetPaths.clear();

    super.dispose();
  }
}
