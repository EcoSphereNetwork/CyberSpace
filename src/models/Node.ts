import * as THREE from 'three';

export class Node {
  private mesh: THREE.Mesh;

  constructor(type: 'server' | 'client' | 'router') {
    // Create geometry based on type
    let geometry: THREE.BufferGeometry;
    switch (type) {
      case 'server':
        geometry = new THREE.BoxGeometry(1, 1, 1);
        break;
      case 'client':
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
        break;
      case 'router':
        geometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 32);
        break;
    }

    // Create material based on type
    const material = new THREE.MeshPhongMaterial({
      color: this.getColorForType(type),
      metalness: 0.5,
      roughness: 0.5,
    });

    // Create mesh
    this.mesh = new THREE.Mesh(geometry, material);
  }

  private getColorForType(type: 'server' | 'client' | 'router'): number {
    switch (type) {
      case 'server':
        return 0x4caf50; // Green
      case 'client':
        return 0x2196f3; // Blue
      case 'router':
        return 0x9c27b0; // Purple
    }
  }

  getMesh(): THREE.Mesh {
    return this.mesh;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}
