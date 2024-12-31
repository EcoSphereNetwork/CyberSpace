import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ResourceManager } from '@/core/ResourceManager';
import { Node } from '@/models/Node';

export class NetworkScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private _renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private nodes: Map<string, THREE.Object3D>;
  private connections: Map<string, THREE.Line>;
  private resourceManager: ResourceManager;

  constructor(container: HTMLElement) {
    // Initialize scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 10;

    // Initialize renderer
    this._renderer = new THREE.WebGLRenderer({ antialias: true });
    this._renderer.setSize(container.clientWidth, container.clientHeight);
    this._renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this._renderer.domElement);

    // Initialize controls
    this.controls = new OrbitControls(this.camera, this._renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.enableZoom = true;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 20;

    // Get resource manager
    this.resourceManager = ResourceManager.getInstance();

    // Initialize collections
    this.nodes = new Map();
    this.connections = new Map();

    // Initialize scene
    this.initializeScene();

    // Start animation
    this.animate();

    // Add resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private async initializeScene(): Promise<void> {
    try {
      // Load resources
      const nodeModel = await this.resourceManager.load('/models/node.glb', 'model');
      const nodeTexture = await this.resourceManager.load('/textures/node.jpg', 'texture');
      const networkData = await this.resourceManager.load('/data/network.json', 'json');

      // Create nodes
      for (const nodeData of networkData.nodes) {
        const node = new Node(nodeData.type);
        const mesh = node.getMesh();
        mesh.position.set(
          nodeData.position.x,
          nodeData.position.y,
          nodeData.position.z
        );
        this.scene.add(mesh);
        this.nodes.set(nodeData.id, mesh);
      }

      // Create connections
      for (const connectionData of networkData.connections) {
        const sourceNode = this.nodes.get(connectionData.source);
        const targetNode = this.nodes.get(connectionData.target);

        if (sourceNode && targetNode) {
          const points = [sourceNode.position, targetNode.position];
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const material = new THREE.LineBasicMaterial({
            color: 0x00ff00,
            linewidth: 2,
          });
          const line = new THREE.Line(geometry, material);
          this.scene.add(line);
          this.connections.set(connectionData.id, line);
        }
      }

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040);
      this.scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 3, 5);
      this.scene.add(directionalLight);
    } catch (error) {
      console.error('Failed to initialize scene:', error);
      throw error;
    }
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // Update controls
    this.controls.update();

    // Update node rotations
    for (const node of this.nodes.values()) {
      node.rotation.y += 0.01;
    }

    // Render
    this._renderer.render(this.scene, this.camera);
  };

  private onWindowResize = (): void => {
    const container = this._renderer.domElement.parentElement;
    if (!container) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this._renderer.setSize(container.clientWidth, container.clientHeight);
  };

  resetCamera(): void {
    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
    this.controls.reset();
  }

  toggleVR(): void {
    // TODO: Implement VR mode
    console.log('VR mode not implemented yet');
  }

  dispose(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);

    // Dispose nodes
    for (const node of this.nodes.values()) {
      this.scene.remove(node);
      if ('geometry' in node) {
        node.geometry.dispose();
      }
      if ('material' in node) {
        const material = node.material;
        if (Array.isArray(material)) {
          material.forEach(m => m.dispose());
        } else {
          material.dispose();
        }
      }
    }
    this.nodes.clear();

    // Dispose connections
    for (const connection of this.connections.values()) {
      this.scene.remove(connection);
      connection.geometry.dispose();
      (connection.material as THREE.Material).dispose();
    }
    this.connections.clear();

    // Dispose renderer
    this._renderer.dispose();

    // Remove from DOM
    this._renderer.domElement.remove();
  }

  get renderer(): THREE.WebGLRenderer {
    return this._renderer;
  }

  getScene(): THREE.Scene {
    return this.scene;
  }
}
