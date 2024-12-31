import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ResourceManager } from '@/core/ResourceManager';

export class EarthScene {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private _renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private earth: THREE.Mesh;
  private clouds: THREE.Mesh;
  private stars: THREE.Mesh;
  private resourceManager: ResourceManager;

  constructor(container: HTMLElement) {
    // Initialize scene
    this.scene = new THREE.Scene();

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.z = 5;

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
    this.controls.minDistance = 3;
    this.controls.maxDistance = 10;

    // Get resource manager
    this.resourceManager = ResourceManager.getInstance();

    // Initialize objects
    this.earth = new THREE.Mesh();
    this.clouds = new THREE.Mesh();
    this.stars = new THREE.Mesh();

    // Initialize scene
    this.initializeScene();

    // Start animation
    this.animate();

    // Add resize handler
    window.addEventListener('resize', this.onWindowResize);
  }

  private async initializeScene(): Promise<void> {
    try {
      // Load textures
      const earthTexture = await this.resourceManager.load('/textures/earth.jpg', 'texture');
      const cloudsTexture = await this.resourceManager.load('/textures/clouds.jpg', 'texture');
      const starsTexture = await this.resourceManager.load('/textures/stars.jpg', 'texture');

      // Create Earth
      const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
      const earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpScale: 0.05,
      });
      this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
      this.scene.add(this.earth);

      // Create clouds
      const cloudsGeometry = new THREE.SphereGeometry(2.05, 64, 64);
      const cloudsMaterial = new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        transparent: true,
        opacity: 0.4,
      });
      this.clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
      this.scene.add(this.clouds);

      // Create stars
      const starsGeometry = new THREE.SphereGeometry(90, 64, 64);
      const starsMaterial = new THREE.MeshBasicMaterial({
        map: starsTexture,
        side: THREE.BackSide,
      });
      this.stars = new THREE.Mesh(starsGeometry, starsMaterial);
      this.scene.add(this.stars);

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

    // Rotate Earth and clouds
    this.earth.rotation.y += 0.001;
    this.clouds.rotation.y += 0.0015;

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
    this.camera.position.set(0, 0, 5);
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

    // Dispose geometries
    this.earth.geometry.dispose();
    this.clouds.geometry.dispose();
    this.stars.geometry.dispose();

    // Dispose materials
    (this.earth.material as THREE.Material).dispose();
    (this.clouds.material as THREE.Material).dispose();
    (this.stars.material as THREE.Material).dispose();

    // Dispose textures
    const earthTexture = (this.earth.material as THREE.MeshPhongMaterial).map;
    const cloudsTexture = (this.clouds.material as THREE.MeshPhongMaterial).map;
    const starsTexture = (this.stars.material as THREE.MeshBasicMaterial).map;
    if (earthTexture) earthTexture.dispose();
    if (cloudsTexture) cloudsTexture.dispose();
    if (starsTexture) starsTexture.dispose();

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
