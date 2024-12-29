import { EventEmitter } from '@/utils/EventEmitter';
import { WebGLRenderer, Scene, Camera, XRFrame } from 'three';

export interface WebXRConfig {
  enabled?: boolean;
  mode?: 'vr' | 'ar' | 'hybrid';
  referenceSpaceType?: XRReferenceSpaceType;
  sessionMode?: XRSessionMode;
  optionalFeatures?: string[];
}

export class WebXRManager extends EventEmitter {
  private config: Required<WebXRConfig>;
  private renderer: WebGLRenderer | null = null;
  private session: XRSession | null = null;
  private referenceSpace: XRReferenceSpace | null = null;
  private initialized: boolean = false;

  constructor(config: WebXRConfig = {}) {
    super();

    this.config = {
      enabled: config.enabled ?? false,
      mode: config.mode ?? 'vr',
      referenceSpaceType: config.referenceSpaceType ?? 'local-floor',
      sessionMode: config.sessionMode ?? 'immersive-vr',
      optionalFeatures: config.optionalFeatures ?? [
        'local-floor',
        'bounded-floor',
        'hand-tracking',
        'layers',
      ],
    };

    // Bind methods
    this.onSessionStarted = this.onSessionStarted.bind(this);
    this.onSessionEnded = this.onSessionEnded.bind(this);
    this.onXRFrame = this.onXRFrame.bind(this);
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (!this.isSupported()) {
      throw new Error('WebXR not supported');
    }

    this.renderer = new WebGLRenderer({ antialias: true });
    this.renderer.xr.enabled = true;

    this.initialized = true;
    this.emit('initialized');
  }

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      return;
    }

    await this.endSession();

    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.initialized = false;
    this.emit('shutdown');
  }

  isSupported(): boolean {
    return 'xr' in navigator && 'isSessionSupported' in (navigator as any).xr;
  }

  async isSessionSupported(mode: XRSessionMode = 'immersive-vr'): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      return await (navigator as any).xr.isSessionSupported(mode);
    } catch (error) {
      console.error('Error checking XR session support:', error);
      return false;
    }
  }

  async startSession(): Promise<boolean> {
    if (!this.initialized || !this.renderer) {
      throw new Error('WebXRManager not initialized');
    }

    if (this.session) {
      console.warn('XR session already active');
      return true;
    }

    try {
      const sessionInit: XRSessionInit = {
        optionalFeatures: this.config.optionalFeatures,
      };

      this.session = await (navigator as any).xr.requestSession(
        this.config.sessionMode,
        sessionInit
      );

      this.session.addEventListener('end', this.onSessionEnded);
      await this.renderer.xr.setSession(this.session);

      this.referenceSpace = await this.session.requestReferenceSpace(
        this.config.referenceSpaceType
      );

      this.session.requestAnimationFrame(this.onXRFrame);
      this.emit('sessionStarted', this.session);
      return true;
    } catch (error) {
      console.error('Failed to start XR session:', error);
      this.emit('error', error);
      return false;
    }
  }

  async endSession(): Promise<void> {
    if (this.session) {
      await this.session.end();
    }
  }

  async toggle(): Promise<boolean> {
    if (this.session) {
      await this.endSession();
      return false;
    } else {
      return this.startSession();
    }
  }

  private onSessionStarted(session: XRSession): void {
    this.session = session;
    this.emit('sessionStarted', session);
  }

  private onSessionEnded(): void {
    this.session = null;
    this.referenceSpace = null;
    this.emit('sessionEnded');
  }

  private onXRFrame(time: number, frame: XRFrame): void {
    if (!this.session || !this.referenceSpace) {
      return;
    }

    this.session.requestAnimationFrame(this.onXRFrame);
    this.emit('frame', { time, frame });
  }

  getSession(): XRSession | null {
    return this.session;
  }

  getReferenceSpace(): XRReferenceSpace | null {
    return this.referenceSpace;
  }

  getRenderer(): WebGLRenderer | null {
    return this.renderer;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getMode(): WebXRConfig['mode'] {
    return this.config.mode;
  }

  setMode(mode: WebXRConfig['mode']): void {
    this.config.mode = mode;
    this.emit('modeChanged', mode);
  }
}