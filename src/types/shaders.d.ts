declare module '*.vert' {
  const content: string;
  export default content;
}

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}

declare module 'simplex-noise' {
  export default class SimplexNoise {
    constructor(seed?: string | number);
    noise2D(x: number, y: number): number;
    noise3D(x: number, y: number, z: number): number;
    noise4D(x: number, y: number, z: number, w: number): number;
  }
}

declare module 'three/examples/jsm/renderers/CSS3DRenderer' {
  import { Object3D, Scene, Camera, WebGLRenderer } from 'three';

  export class CSS3DObject extends Object3D {
    constructor(element: HTMLElement);
    element: HTMLElement;
  }

  export class CSS3DRenderer {
    constructor();
    domElement: HTMLElement;
    setSize(width: number, height: number): void;
    render(scene: Scene, camera: Camera): void;
  }
}

declare module 'three/examples/jsm/controls/OrbitControls' {
  import { Camera, MOUSE, TOUCH, Vector3 } from 'three';

  export class OrbitControls {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: Vector3;
    minDistance: number;
    maxDistance: number;
    minZoom: number;
    maxZoom: number;
    minPolarAngle: number;
    maxPolarAngle: number;
    minAzimuthAngle: number;
    maxAzimuthAngle: number;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    zoomSpeed: number;
    enableRotate: boolean;
    rotateSpeed: number;
    enablePan: boolean;
    panSpeed: number;
    screenSpacePanning: boolean;
    keyPanSpeed: number;
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableKeys: boolean;
    keys: { LEFT: string; UP: string; RIGHT: string; BOTTOM: string };
    mouseButtons: { LEFT: MOUSE; MIDDLE: MOUSE; RIGHT: MOUSE };
    touches: { ONE: TOUCH; TWO: TOUCH };
    update(): boolean;
    saveState(): void;
    reset(): void;
    dispose(): void;
  }
}
