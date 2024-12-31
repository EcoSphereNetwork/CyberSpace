import { Scene, WebGLRenderer, Camera, ShaderMaterial, PlaneGeometry, Mesh, OrthographicCamera } from 'three';
import { EventEmitter } from '@/utils/EventEmitter';

interface TransitionOptions {
  duration?: number;
  type?: 'fade' | 'dissolve' | 'wipe' | 'zoom';
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
  direction?: 'left' | 'right' | 'up' | 'down';
}

export class TransitionManager extends EventEmitter {
  private static instance: TransitionManager;
  private renderer: WebGLRenderer | null;
  private transitionMesh: Mesh | null;
  private transitionCamera: OrthographicCamera | null;
  private transitionScene: Scene | null;
  private isTransitioning: boolean;

  private constructor() {
    super();
    this.renderer = null;
    this.transitionMesh = null;
    this.transitionCamera = null;
    this.transitionScene = null;
    this.isTransitioning = false;
  }

  static getInstance(): TransitionManager {
    if (!TransitionManager.instance) {
      TransitionManager.instance = new TransitionManager();
    }
    return TransitionManager.instance;
  }

  initialize(renderer: WebGLRenderer): void {
    this.renderer = renderer;
    this.initializeTransitionScene();
  }

  private initializeTransitionScene(): void {
    // Create orthographic camera
    this.transitionCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    // Create scene
    this.transitionScene = new Scene();

    // Create transition mesh
    const geometry = new PlaneGeometry(2, 2);
    const material = new ShaderMaterial({
      uniforms: {
        tDiffuse1: { value: null },
        tDiffuse2: { value: null },
        mixRatio: { value: 0 },
        threshold: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse1;
        uniform sampler2D tDiffuse2;
        uniform float mixRatio;
        uniform float threshold;
        varying vec2 vUv;
        void main() {
          vec4 texel1 = texture2D(tDiffuse1, vUv);
          vec4 texel2 = texture2D(tDiffuse2, vUv);
          gl_FragColor = mix(texel1, texel2, mixRatio);
        }
      `,
    });

    this.transitionMesh = new Mesh(geometry, material);
    this.transitionScene.add(this.transitionMesh);
  }

  async transition(
    fromScene: Scene,
    toScene: Scene,
    camera: Camera,
    options: TransitionOptions = {}
  ): Promise<void> {
    if (!this.renderer || !this.transitionScene || !this.transitionCamera || !this.transitionMesh) {
      throw new Error('TransitionManager not initialized');
    }

    if (this.isTransitioning) {
      throw new Error('Transition already in progress');
    }

    this.isTransitioning = true;
    this.emit('transitionStart');

    const {
      duration = 1000,
      type = 'fade',
      easing = 'linear',
      direction = 'right',
    } = options;

    // Update shader uniforms based on transition type
    const material = this.transitionMesh.material as ShaderMaterial;
    switch (type) {
      case 'dissolve':
        material.fragmentShader = `
          uniform sampler2D tDiffuse1;
          uniform sampler2D tDiffuse2;
          uniform float mixRatio;
          varying vec2 vUv;
          void main() {
            vec4 texel1 = texture2D(tDiffuse1, vUv);
            vec4 texel2 = texture2D(tDiffuse2, vUv);
            vec4 transitionTexel = mix(texel1, texel2, mixRatio);
            gl_FragColor = transitionTexel;
          }
        `;
        break;

      case 'wipe':
        material.fragmentShader = `
          uniform sampler2D tDiffuse1;
          uniform sampler2D tDiffuse2;
          uniform float mixRatio;
          varying vec2 vUv;
          void main() {
            vec4 texel1 = texture2D(tDiffuse1, vUv);
            vec4 texel2 = texture2D(tDiffuse2, vUv);
            float threshold = ${direction === 'right' || direction === 'down' ? 'vUv.x' : '1.0 - vUv.x'};
            gl_FragColor = threshold < mixRatio ? texel2 : texel1;
          }
        `;
        break;

      case 'zoom':
        material.fragmentShader = `
          uniform sampler2D tDiffuse1;
          uniform sampler2D tDiffuse2;
          uniform float mixRatio;
          varying vec2 vUv;
          void main() {
            vec2 center = vec2(0.5, 0.5);
            vec2 uv1 = mix(vUv, center, mixRatio);
            vec2 uv2 = mix(center, vUv, mixRatio);
            vec4 texel1 = texture2D(tDiffuse1, uv1);
            vec4 texel2 = texture2D(tDiffuse2, uv2);
            gl_FragColor = mix(texel1, texel2, mixRatio);
          }
        `;
        break;
    }

    material.needsUpdate = true;

    // Perform transition
    const startTime = Date.now();
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      let progress = Math.min(elapsed / duration, 1);

      // Apply easing
      switch (easing) {
        case 'easeIn':
          progress = progress * progress;
          break;
        case 'easeOut':
          progress = 1 - (1 - progress) * (1 - progress);
          break;
        case 'easeInOut':
          progress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          break;
      }

      // Update transition material
      material.uniforms.mixRatio.value = progress;

      // Render transition
      this.renderer.setRenderTarget(null);
      if (progress < 1) {
        this.renderer.render(fromScene, camera);
        requestAnimationFrame(animate);
      } else {
        this.renderer.render(toScene, camera);
        this.isTransitioning = false;
        this.emit('transitionComplete');
      }
    };

    animate();
  }

  dispose(): void {
    if (this.transitionMesh) {
      this.transitionMesh.geometry.dispose();
      (this.transitionMesh.material as ShaderMaterial).dispose();
    }
    this.transitionMesh = null;
    this.transitionCamera = null;
    this.transitionScene = null;
    this.renderer = null;
  }
}