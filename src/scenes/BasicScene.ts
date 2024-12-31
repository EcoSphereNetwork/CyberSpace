import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  BoxGeometry,
  MeshStandardMaterial,
  Mesh,
  DirectionalLight,
  AmbientLight,
  GridHelper,
  Color,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export class BasicScene {
  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private controls: OrbitControls;
  private cube: Mesh;

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
    this.camera.position.z = 5;
    this.camera.position.y = 2;

    // Create renderer
    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // Add lights
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new GridHelper(10, 10);
    this.scene.add(gridHelper);

    // Create cube
    const geometry = new BoxGeometry();
    const material = new MeshStandardMaterial({ color: 0x00ff00 });
    this.cube = new Mesh(geometry, material);
    this.cube.position.y = 0.5;
    this.scene.add(this.cube);

    // Start animation
    this.animate();

    // Handle resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    // Rotate cube
    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    // Update controls
    this.controls.update();

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

    // Dispose of Three.js objects
    this.scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    // Dispose of renderer
    this.renderer.dispose();

    // Remove canvas
    this.renderer.domElement.remove();
  }
}