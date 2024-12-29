import { Layer, LayerConfig } from '@/core/layers/Layer';
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
  CSS3DObject,
  CSS3DRenderer,
} from 'three/examples/jsm/renderers/CSS3DRenderer';
import { Vector3, Quaternion, Matrix4, Object3D } from 'three';
import styled from '@emotion/styled';

interface UIElement {
  id: string;
  type: 'window' | 'panel' | 'hud' | 'custom';
  position: Vector3;
  rotation?: Quaternion;
  scale?: Vector3;
  content: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
  interactive?: boolean;
  metadata?: Record<string, any>;
}

interface UIGroup {
  id: string;
  elements: UIElement[];
  position?: Vector3;
  rotation?: Quaternion;
  scale?: Vector3;
  metadata?: Record<string, any>;
}

interface UILayerConfig extends LayerConfig {
  elements?: UIElement[];
  groups?: UIGroup[];
  renderer?: CSS3DRenderer;
  defaultScale?: number;
  interactive?: boolean;
}

// Styled components for UI elements
const UIContainer = styled.div<{ interactive: boolean }>`
  position: absolute;
  transform-origin: 0 0;
  pointer-events: ${(props) => (props.interactive ? 'auto' : 'none')};
  user-select: none;
  backface-visibility: hidden;
`;

const Window = styled.div`
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
`;

const Panel = styled.div`
  background: rgba(30, 30, 30, 0.6);
  border-radius: 4px;
  padding: 12px;
  color: white;
`;

const HUD = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 1000;
`;

/**
 * Layer for UI elements in 3D space
 */
export class UILayer extends Layer {
  private readonly uiConfig: UILayerConfig;
  private elements: Map<string, CSS3DObject>;
  private groups: Map<string, Object3D>;
  private renderer: CSS3DRenderer;
  private roots: Map<string, Root>;

  constructor(config: UILayerConfig) {
    super(config);
    this.uiConfig = config;
    this.elements = new Map();
    this.groups = new Map();
    this.roots = new Map();

    // Initialize CSS3D renderer
    this.renderer = config.renderer ?? new CSS3DRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild(this.renderer.domElement);

    // Handle window resize
    window.addEventListener('resize', this.handleResize);
  }

  protected async loadResources(): Promise<void> {
    // Load initial UI elements
    if (this.uiConfig.elements) {
      for (const element of this.uiConfig.elements) {
        await this.createUIElement(element);
      }
    }

    // Load UI groups
    if (this.uiConfig.groups) {
      for (const group of this.uiConfig.groups) {
        await this.createUIGroup(group);
      }
    }
  }

  protected async setup(): Promise<void> {
    // Additional setup if needed
  }

  protected updateLayer(deltaTime: number): void {
    // Update UI elements
    this.elements.forEach((object, id) => {
      this.updateUIElement(object, deltaTime);
    });

    // Update UI groups
    this.groups.forEach((group, id) => {
      this.updateUIGroup(group, deltaTime);
    });

    // Render CSS3D scene
    if (this.state.visible) {
      this.renderer.render(this.root, this.getCamera());
    }
  }

  /**
   * Create a UI element
   */
  private async createUIElement(config: UIElement): Promise<CSS3DObject> {
    // Create container element
    const container = document.createElement('div');
    const root = createRoot(container);
    this.roots.set(config.id, root);

    // Render React component
    root.render(
      <UIContainer
        interactive={config.interactive ?? this.uiConfig.interactive ?? true}
        style={config.style}
        className={config.className}
      >
        {this.renderUIContent(config)}
      </UIContainer>
    );

    // Create CSS3D object
    const object = new CSS3DObject(container);
    object.position.copy(config.position);
    if (config.rotation) object.quaternion.copy(config.rotation);
    if (config.scale) {
      object.scale.copy(config.scale);
    } else {
      object.scale.setScalar(this.uiConfig.defaultScale ?? 0.01);
    }

    // Store element
    this.elements.set(config.id, object);
    this.resources.objects.set(`ui_${config.id}`, object);

    // Add to root
    this.root.add(object);

    return object;
  }

  /**
   * Create a UI group
   */
  private async createUIGroup(config: UIGroup): Promise<Object3D> {
    const group = new Object3D();
    group.name = config.id;

    if (config.position) group.position.copy(config.position);
    if (config.rotation) group.quaternion.copy(config.rotation);
    if (config.scale) group.scale.copy(config.scale);

    // Create elements
    for (const element of config.elements) {
      const object = await this.createUIElement(element);
      group.add(object);
    }

    // Store group
    this.groups.set(config.id, group);
    this.resources.objects.set(`group_${config.id}`, group);

    // Add to root
    this.root.add(group);

    return group;
  }

  /**
   * Render UI content based on type
   */
  private renderUIContent(config: UIElement): React.ReactNode {
    switch (config.type) {
      case 'window':
        return <Window>{config.content}</Window>;
      case 'panel':
        return <Panel>{config.content}</Panel>;
      case 'hud':
        return <HUD>{config.content}</HUD>;
      default:
        return config.content;
    }
  }

  /**
   * Update a UI element
   */
  private updateUIElement(object: CSS3DObject, deltaTime: number): void {
    // Add animation or update logic here
  }

  /**
   * Update a UI group
   */
  private updateUIGroup(group: Object3D, deltaTime: number): void {
    // Add animation or update logic here
  }

  /**
   * Handle window resize
   */
  private handleResize = (): void => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /**
   * Get camera from scene
   */
  private getCamera(): THREE.Camera {
    return this.root.parent?.parent as THREE.Camera;
  }

  /**
   * Add UI element
   */
  public async addElement(element: UIElement): Promise<CSS3DObject> {
    return this.createUIElement(element);
  }

  /**
   * Remove UI element
   */
  public removeElement(id: string): void {
    const element = this.elements.get(id);
    if (element) {
      element.removeFromParent();
      this.elements.delete(id);
      this.resources.objects.delete(`ui_${id}`);

      // Cleanup React root
      const root = this.roots.get(id);
      if (root) {
        root.unmount();
        this.roots.delete(id);
      }

      this.emit('elementRemoved', id);
    }
  }

  /**
   * Add UI group
   */
  public async addGroup(group: UIGroup): Promise<Object3D> {
    return this.createUIGroup(group);
  }

  /**
   * Remove UI group
   */
  public removeGroup(id: string): void {
    const group = this.groups.get(id);
    if (group) {
      // Remove all elements in group
      group.traverse((child) => {
        if (child instanceof CSS3DObject) {
          const elementId = child.name;
          this.removeElement(elementId);
        }
      });

      group.removeFromParent();
      this.groups.delete(id);
      this.resources.objects.delete(`group_${id}`);

      this.emit('groupRemoved', id);
    }
  }

  /**
   * Update element position
   */
  public setElementPosition(id: string, position: Vector3): void {
    const element = this.elements.get(id);
    if (element) {
      element.position.copy(position);
      this.emit('elementMoved', { id, position });
    }
  }

  /**
   * Update element rotation
   */
  public setElementRotation(id: string, rotation: Quaternion): void {
    const element = this.elements.get(id);
    if (element) {
      element.quaternion.copy(rotation);
      this.emit('elementRotated', { id, rotation });
    }
  }

  /**
   * Update element scale
   */
  public setElementScale(id: string, scale: Vector3): void {
    const element = this.elements.get(id);
    if (element) {
      element.scale.copy(scale);
      this.emit('elementScaled', { id, scale });
    }
  }

  /**
   * Update element content
   */
  public updateElementContent(id: string, content: React.ReactNode): void {
    const root = this.roots.get(id);
    if (root) {
      const element = this.elements.get(id);
      if (element) {
        const config = element.userData as UIElement;
        root.render(
          <UIContainer
            interactive={
              config.interactive ?? this.uiConfig.interactive ?? true
            }
            style={config.style}
            className={config.className}
          >
            {this.renderUIContent({ ...config, content })}
          </UIContainer>
        );
        this.emit('elementUpdated', { id, content });
      }
    }
  }

  /**
   * Cleanup on dispose
   */
  public dispose(): void {
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);

    // Cleanup React roots
    this.roots.forEach((root) => root.unmount());
    this.roots.clear();

    // Remove renderer
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    super.dispose();
  }
}
