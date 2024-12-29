import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  GridHelper,
  Color,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { NetworkLayer, NetworkNode, NetworkConnection, DataFlow } from '@/layers/network/NetworkLayer';

export class NetworkScene {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private networkLayer: NetworkLayer;

  constructor(container: HTMLElement) {
    // Create scene
    this.scene = new Scene();
    this.scene.background = new Color(0x1a1a1a);

    // Create camera
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(5, 5, 5);
    this.camera.lookAt(0, 0, 0);

    // Create renderer
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Add lights
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new GridHelper(10, 10);
    this.scene.add(gridHelper);

    // Create network layer
    this.networkLayer = new NetworkLayer(this.scene);

    // Add example network
    this.createExampleNetwork();

    // Start animation
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private createExampleNetwork(): void {
    // Create nodes
    const nodes: NetworkNode[] = [
      {
        id: 'server1',
        position: new Vector3(0, 1, 0),
        type: 'server',
        status: 'active',
      },
      {
        id: 'router1',
        position: new Vector3(-2, 1, -2),
        type: 'router',
        status: 'active',
      },
      {
        id: 'router2',
        position: new Vector3(2, 1, -2),
        type: 'router',
        status: 'active',
      },
      {
        id: 'switch1',
        position: new Vector3(-2, 1, 2),
        type: 'switch',
        status: 'active',
      },
      {
        id: 'switch2',
        position: new Vector3(2, 1, 2),
        type: 'switch',
        status: 'active',
      },
      {
        id: 'client1',
        position: new Vector3(-4, 1, 2),
        type: 'client',
        status: 'active',
      },
      {
        id: 'client2',
        position: new Vector3(0, 1, 4),
        type: 'client',
        status: 'active',
      },
      {
        id: 'client3',
        position: new Vector3(4, 1, 2),
        type: 'client',
        status: 'active',
      },
    ];

    // Add nodes
    nodes.forEach((node) => this.networkLayer.addNode(node));

    // Create connections
    const connections: NetworkConnection[] = [
      {
        id: 'conn1',
        source: 'server1',
        target: 'router1',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn2',
        source: 'server1',
        target: 'router2',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn3',
        source: 'router1',
        target: 'switch1',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn4',
        source: 'router2',
        target: 'switch2',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn5',
        source: 'switch1',
        target: 'client1',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn6',
        source: 'switch1',
        target: 'client2',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn7',
        source: 'switch2',
        target: 'client2',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'conn8',
        source: 'switch2',
        target: 'client3',
        type: 'physical',
        status: 'active',
      },
    ];

    // Add connections
    connections.forEach((conn) => this.networkLayer.addConnection(conn));

    // Simulate data flows
    setInterval(() => {
      const flow: DataFlow = {
        id: `flow_${Date.now()}`,
        connection: connections[Math.floor(Math.random() * connections.length)].id,
        type: Math.random() > 0.5 ? 'request' : 'response',
        size: Math.random() * 100,
        speed: 1 + Math.random() * 2,
      };
      this.networkLayer.addDataFlow(flow);
    }, 1000);
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Update controls
    this.controls.update();

    // Update network layer
    this.networkLayer.update(0.016); // Assuming 60fps

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize() {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }

  dispose() {
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this));

    // Dispose of network layer
    this.networkLayer.dispose();

    // Dispose of Three.js objects
    this.scene.traverse((object) => {
      if ('geometry' in object) {
        object.geometry?.dispose();
      }
      if ('material' in object) {
        const material = object.material;
        if (Array.isArray(material)) {
          material.forEach((m) => m.dispose());
        } else {
          material?.dispose();
        }
      }
    });

    // Dispose of renderer
    this.renderer.dispose();

    // Remove canvas
    this.renderer.domElement.remove();
  }
}