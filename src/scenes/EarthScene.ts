import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  PointLight,
  SphereGeometry,
  MeshPhongMaterial,
  MeshBasicMaterial,
  Mesh,
  TextureLoader,
  BackSide,
  Vector3,
} from 'three';
import { NetworkLayer, NetworkNode, NetworkConnection } from '@/layers/network/NetworkLayer';

export class EarthScene {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private networkLayer: NetworkLayer;

  // Earth objects
  private earthMesh: Mesh;
  private cloudMesh: Mesh;
  private starMesh: Mesh;

  // Mouse controls
  private targetRotationX: number = 0.05;
  private targetRotationY: number = 0.02;
  private mouseX: number = 0;
  private mouseXOnMouseDown: number = 0;
  private mouseY: number = 0;
  private mouseYOnMouseDown: number = 0;
  private windowHalfX: number;
  private windowHalfY: number;
  private readonly slowingFactor: number = 0.98;
  private readonly dragFactor: number = 0.0002;

  constructor(container: HTMLElement) {
    // Initialize window dimensions
    this.windowHalfX = container.clientWidth / 2;
    this.windowHalfY = container.clientHeight / 2;

    // Create scene
    this.scene = new Scene();

    // Create renderer
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Create camera
    this.camera = new PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 1.7;

    // Add lights
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const pointLight = new PointLight(0xffffff, 0.9);
    pointLight.position.set(5, 3, 5);
    this.scene.add(pointLight);

    // Create Earth
    const earthGeometry = new SphereGeometry(0.5, 32, 32);
    const earthMaterial = new MeshPhongMaterial({
      color: 0x2233ff,
      emissive: 0x112244,
      specular: 0x333333,
      shininess: 25,
    });
    this.earthMesh = new Mesh(earthGeometry, earthMaterial);
    this.scene.add(this.earthMesh);

    // Create clouds
    const cloudGeometry = new SphereGeometry(0.52, 32, 32);
    const cloudMaterial = new MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    });
    this.cloudMesh = new Mesh(cloudGeometry, cloudMaterial);
    this.scene.add(this.cloudMesh);

    // Create stars
    const starGeometry = new SphereGeometry(5, 64, 64);
    const starMaterial = new MeshBasicMaterial({
      color: 0x000000,
      side: BackSide,
    });
    this.starMesh = new Mesh(starGeometry, starMaterial);
    this.scene.add(this.starMesh);

    // Create network layer
    this.networkLayer = new NetworkLayer(this.scene);

    // Add example network
    this.createExampleNetwork();

    // Add event listeners
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('resize', this.onWindowResize);

    // Start animation
    this.animate();
  }

  private createExampleNetwork(): void {
    // Create nodes at major cities
    const nodes: NetworkNode[] = [
      {
        id: 'new_york',
        position: this.latLongToVector3(40.7128, -74.0060, 0.53),
        type: 'server',
        status: 'active',
      },
      {
        id: 'london',
        position: this.latLongToVector3(51.5074, -0.1278, 0.53),
        type: 'server',
        status: 'active',
      },
      {
        id: 'tokyo',
        position: this.latLongToVector3(35.6762, 139.6503, 0.53),
        type: 'server',
        status: 'active',
      },
      {
        id: 'sydney',
        position: this.latLongToVector3(-33.8688, 151.2093, 0.53),
        type: 'server',
        status: 'active',
      },
      {
        id: 'sao_paulo',
        position: this.latLongToVector3(-23.5505, -46.6333, 0.53),
        type: 'server',
        status: 'active',
      },
    ];

    // Add nodes
    nodes.forEach((node) => this.networkLayer.addNode(node));

    // Create connections
    const connections: NetworkConnection[] = [
      {
        id: 'ny_london',
        source: 'new_york',
        target: 'london',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'london_tokyo',
        source: 'london',
        target: 'tokyo',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'tokyo_sydney',
        source: 'tokyo',
        target: 'sydney',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'sydney_sao_paulo',
        source: 'sydney',
        target: 'sao_paulo',
        type: 'physical',
        status: 'active',
      },
      {
        id: 'sao_paulo_ny',
        source: 'sao_paulo',
        target: 'new_york',
        type: 'physical',
        status: 'active',
      },
    ];

    // Add connections
    connections.forEach((conn) => this.networkLayer.addConnection(conn));

    // Simulate data flows
    setInterval(() => {
      const flow = {
        id: `flow_${Date.now()}`,
        connection: connections[Math.floor(Math.random() * connections.length)].id,
        type: Math.random() > 0.5 ? 'request' : 'response',
        size: Math.random() * 100,
        speed: 1 + Math.random() * 2,
      };
      this.networkLayer.addDataFlow(flow);
    }, 1000);
  }

  private latLongToVector3(lat: number, long: number, radius: number): Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (long + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return new Vector3(x, y, z);
  }

  private onMouseDown = (event: MouseEvent) => {
    event.preventDefault();

    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);

    this.mouseXOnMouseDown = event.clientX - this.windowHalfX;
    this.mouseYOnMouseDown = event.clientY - this.windowHalfY;
  };

  private onMouseMove = (event: MouseEvent) => {
    this.mouseX = event.clientX - this.windowHalfX;
    this.targetRotationX = (this.mouseX - this.mouseXOnMouseDown) * this.dragFactor;

    this.mouseY = event.clientY - this.windowHalfY;
    this.targetRotationY = (this.mouseY - this.mouseYOnMouseDown) * this.dragFactor;
  };

  private onMouseUp = () => {
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);
  };

  private onWindowResize = () => {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;

    this.windowHalfX = container.clientWidth / 2;
    this.windowHalfY = container.clientHeight / 2;

    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Rotate Earth and clouds
    this.earthMesh.rotateOnWorldAxis(new Vector3(0, 1, 0), this.targetRotationX);
    this.earthMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), this.targetRotationY);
    this.cloudMesh.rotateOnWorldAxis(new Vector3(0, 1, 0), this.targetRotationX);
    this.cloudMesh.rotateOnWorldAxis(new Vector3(1, 0, 0), this.targetRotationY);

    // Apply slowing factor
    this.targetRotationY *= this.slowingFactor;
    this.targetRotationX *= this.slowingFactor;

    // Update network layer
    this.networkLayer.update(0.016); // Assuming 60fps

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    // Remove event listeners
    this.renderer.domElement.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('resize', this.onWindowResize);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

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