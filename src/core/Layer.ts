import { Scene, Group } from 'three';
import { EventEmitter } from '@/utils/EventEmitter';

export abstract class Layer extends EventEmitter {
  protected scene: Scene;
  protected container: Group;
  protected visible: boolean;
  protected enabled: boolean;

  constructor(scene: Scene) {
    super();
    this.scene = scene;
    this.container = new Group();
    this.visible = true;
    this.enabled = true;
    this.scene.add(this.container);
  }

  setVisible(visible: boolean): void {
    this.visible = visible;
    this.container.visible = visible;
    this.emit('visibilityChanged', visible);
  }

  isVisible(): boolean {
    return this.visible;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.emit('enabledChanged', enabled);
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  abstract update(deltaTime: number): void;

  dispose(): void {
    // Remove container from scene
    this.scene.remove(this.container);

    // Dispose of all objects in the container
    this.container.traverse((object) => {
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

    // Clear container
    while (this.container.children.length > 0) {
      this.container.remove(this.container.children[0]);
    }
  }
}