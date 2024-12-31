import {
  Scene,
  Object3D,
  Vector3,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  CylinderGeometry,
  Color,
  Line,
  BufferGeometry,
  LineBasicMaterial,
  Float32BufferAttribute,
  Group,
  AnimationMixer,
  NumberKeyframeTrack,
  AnimationClip,
  LoopOnce,
} from 'three';
import { Layer } from '@/core/layers/Layer';

export interface NetworkNode {
  id: string;
  position: Vector3;
  type: 'server' | 'client' | 'router' | 'switch';
  status: 'active' | 'inactive' | 'warning' | 'error';
  data?: Record<string, any>;
}

export interface NetworkConnection {
  id: string;
  source: string;
  target: string;
  type: 'physical' | 'wireless' | 'virtual';
  status: 'active' | 'inactive' | 'warning' | 'error';
  bandwidth?: number;
  latency?: number;
  data?: Record<string, any>;
}

export interface DataFlow {
  id: string;
  connection: string;
  type: 'data' | 'request' | 'response' | 'error';
  size: number;
  speed: number;
  data?: Record<string, any>;
}

export class NetworkLayer extends Layer {
  private nodes: Map<string, Object3D>;
  private connections: Map<string, Object3D>;
  private flows: Map<string, Object3D>;
  private animations: Map<string, AnimationMixer>;

  constructor(scene: Scene) {
    super(scene);

    this.nodes = new Map();
    this.connections = new Map();
    this.flows = new Map();
    this.animations = new Map();

    // Create container for network objects
    this.container = new Group();
    this.container.name = 'network-layer';
    this.scene.add(this.container);
  }

  addNode(node: NetworkNode): void {
    if (this.nodes.has(node.id)) {
      console.warn(`Node ${node.id} already exists`);
      return;
    }

    // Create node mesh
    const geometry = new SphereGeometry(0.5, 32, 32);
    const material = new MeshStandardMaterial({
      color: this.getNodeColor(node.type, node.status),
      metalness: 0.5,
      roughness: 0.5,
    });
    const mesh = new Mesh(geometry, material);
    mesh.position.copy(node.position);
    mesh.name = `node-${node.id}`;
    mesh.userData = { ...node };

    // Add to container and map
    this.container.add(mesh);
    this.nodes.set(node.id, mesh);

    // Emit event
    this.emit('nodeAdded', node);
  }

  addConnection(connection: NetworkConnection): void {
    if (this.connections.has(connection.id)) {
      console.warn(`Connection ${connection.id} already exists`);
      return;
    }

    // Get source and target nodes
    const source = this.nodes.get(connection.source);
    const target = this.nodes.get(connection.target);
    if (!source || !target) {
      console.warn('Source or target node not found');
      return;
    }

    // Create connection line
    const points = [source.position, target.position];
    const geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({
      color: this.getConnectionColor(connection.type, connection.status),
      linewidth: 2,
    });
    const line = new Line(geometry, material);
    line.name = `connection-${connection.id}`;
    line.userData = { ...connection };

    // Add to container and map
    this.container.add(line);
    this.connections.set(connection.id, line);

    // Emit event
    this.emit('connectionAdded', connection);
  }

  addDataFlow(flow: DataFlow): void {
    if (this.flows.has(flow.id)) {
      console.warn(`Flow ${flow.id} already exists`);
      return;
    }

    // Get connection
    const connection = this.connections.get(flow.connection);
    if (!connection) {
      console.warn('Connection not found');
      return;
    }

    // Create flow particle
    const geometry = new SphereGeometry(0.1, 16, 16);
    const material = new MeshStandardMaterial({
      color: this.getFlowColor(flow.type),
      emissive: this.getFlowColor(flow.type),
      emissiveIntensity: 0.5,
    });
    const particle = new Mesh(geometry, material);
    particle.name = `flow-${flow.id}`;
    particle.userData = { ...flow };

    // Add to container and map
    this.container.add(particle);
    this.flows.set(flow.id, particle);

    // Create animation
    const mixer = new AnimationMixer(particle);
    const source = (connection as Line).geometry.attributes.position;
    const track = new NumberKeyframeTrack(
      '.position[x]',
      [0, flow.speed],
      [source.getX(0), source.getX(1)]
    );
    const clip = new AnimationClip('flow', flow.speed, [track]);
    const action = mixer.clipAction(clip);
    action.setLoop(LoopOnce, 1);
    action.play();

    // Add to animations map
    this.animations.set(flow.id, mixer);

    // Emit event
    this.emit('flowAdded', flow);
  }

  removeNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    // Remove connected flows and connections
    for (const [connectionId, connection] of this.connections) {
      if (
        connection.userData.source === id ||
        connection.userData.target === id
      ) {
        this.removeConnection(connectionId);
      }
    }

    // Remove node
    this.container.remove(node);
    this.nodes.delete(id);

    // Emit event
    this.emit('nodeRemoved', id);
  }

  removeConnection(id: string): void {
    const connection = this.connections.get(id);
    if (!connection) return;

    // Remove flows on this connection
    for (const [flowId, flow] of this.flows) {
      if (flow.userData.connection === id) {
        this.removeFlow(flowId);
      }
    }

    // Remove connection
    this.container.remove(connection);
    this.connections.delete(id);

    // Emit event
    this.emit('connectionRemoved', id);
  }

  removeFlow(id: string): void {
    const flow = this.flows.get(id);
    if (!flow) return;

    // Remove animation
    const mixer = this.animations.get(id);
    if (mixer) {
      mixer.stopAllAction();
      this.animations.delete(id);
    }

    // Remove flow
    this.container.remove(flow);
    this.flows.delete(id);

    // Emit event
    this.emit('flowRemoved', id);
  }

  update(deltaTime: number): void {
    // Update animations
    for (const mixer of this.animations.values()) {
      mixer.update(deltaTime);
    }

    // Update node positions
    for (const node of this.nodes.values()) {
      // Add any node-specific updates here
    }

    // Update connection positions
    for (const connection of this.connections.values()) {
      const source = this.nodes.get(connection.userData.source);
      const target = this.nodes.get(connection.userData.target);
      if (source && target) {
        const geometry = (connection as Line).geometry;
        const positions = geometry.attributes.position;
        positions.setXYZ(0, source.position.x, source.position.y, source.position.z);
        positions.setXYZ(1, target.position.x, target.position.y, target.position.z);
        positions.needsUpdate = true;
      }
    }
  }

  private getNodeColor(type: NetworkNode['type'], status: NetworkNode['status']): Color {
    const colors = {
      server: {
        active: 0x4caf50,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
      client: {
        active: 0x2196f3,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
      router: {
        active: 0x9c27b0,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
      switch: {
        active: 0x00bcd4,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
    };

    return new Color(colors[type][status]);
  }

  private getConnectionColor(
    type: NetworkConnection['type'],
    status: NetworkConnection['status']
  ): Color {
    const colors = {
      physical: {
        active: 0x4caf50,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
      wireless: {
        active: 0x2196f3,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
      virtual: {
        active: 0x9c27b0,
        inactive: 0x9e9e9e,
        warning: 0xff9800,
        error: 0xf44336,
      },
    };

    return new Color(colors[type][status]);
  }

  private getFlowColor(type: DataFlow['type']): Color {
    const colors = {
      data: 0x4caf50,
      request: 0x2196f3,
      response: 0x9c27b0,
      error: 0xf44336,
    };

    return new Color(colors[type]);
  }

  dispose(): void {
    // Clean up animations
    for (const mixer of this.animations.values()) {
      mixer.stopAllAction();
    }
    this.animations.clear();

    // Clean up objects
    for (const node of this.nodes.values()) {
      this.container.remove(node);
    }
    this.nodes.clear();

    for (const connection of this.connections.values()) {
      this.container.remove(connection);
    }
    this.connections.clear();

    for (const flow of this.flows.values()) {
      this.container.remove(flow);
    }
    this.flows.clear();

    // Remove container
    this.scene.remove(this.container);
  }
}
