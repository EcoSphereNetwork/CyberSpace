# CyberSpace Fix Implementation Plan

## 1. Scene Initialization Fix

### Update App Component
```typescript
// src/components/App.tsx
const App: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<EarthScene | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    try {
      sceneRef.current = new EarthScene(containerRef.current);
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
    }

    return () => {
      if (sceneRef.current) {
        sceneRef.current.dispose();
        sceneRef.current = null;
      }
    };
  }, []);

  if (error) return <ErrorScreen message={error} />;
  if (isLoading) return <LoadingScreen />;

  return (
    <Container ref={containerRef}>
      <Overlay />
      <DebugOverlay />
    </Container>
  );
};
```

### Update Earth Scene
```typescript
// src/scenes/EarthScene.ts
export class EarthScene {
  constructor(container: HTMLElement) {
    // Initialize scene
    this.scene = new Scene();
    this.scene.background = new Color(0x000000);

    // Initialize camera with better position
    this.camera = new PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 2, 5);
    this.camera.lookAt(0, 0, 0);

    // Initialize renderer with proper settings
    this.renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // Add better lighting
    const ambientLight = new AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    // Initialize layers
    this.initializeLayers();

    // Start render loop
    this.animate();
  }

  private initializeLayers(): void {
    // Initialize network layer
    this.networkLayer = new NetworkLayer(this.scene);
    
    // Add example network
    this.createExampleNetwork();
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);

    // Update controls
    if (this.controls) {
      this.controls.update();
    }

    // Update layers
    if (this.networkLayer) {
      this.networkLayer.update(0.016);
    }

    // Render
    this.renderer.render(this.scene, this.camera);
  };
}
```

### Add Loading Screen
```typescript
// src/components/ui/LoadingScreen.tsx
export const LoadingScreen: React.FC = () => (
  <LoadingContainer>
    <LoadingSpinner />
    <LoadingText>Loading CyberSpace...</LoadingText>
  </LoadingContainer>
);
```

### Add Error Screen
```typescript
// src/components/ui/ErrorScreen.tsx
export const ErrorScreen: React.FC<{ message: string }> = ({ message }) => (
  <ErrorContainer>
    <ErrorIcon />
    <ErrorTitle>Something went wrong</ErrorTitle>
    <ErrorMessage>{message}</ErrorMessage>
    <RetryButton onClick={() => window.location.reload()}>
      Try Again
    </RetryButton>
  </ErrorContainer>
);
```

### Add Debug Overlay
```typescript
// src/components/ui/DebugOverlay.tsx
export const DebugOverlay: React.FC = () => {
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    objects: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      // Update stats
      setStats({
        fps: 60, // TODO: Get actual FPS
        memory: performance.memory?.usedJSHeapSize || 0,
        objects: 0, // TODO: Get scene object count
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DebugContainer>
      <DebugItem>FPS: {stats.fps}</DebugItem>
      <DebugItem>Memory: {(stats.memory / 1024 / 1024).toFixed(2)} MB</DebugItem>
      <DebugItem>Objects: {stats.objects}</DebugItem>
    </DebugContainer>
  );
};
```

## 2. Resource Management Fix

### Add Resource Manager
```typescript
// src/core/ResourceManager.ts
export class ResourceManager {
  private cache: Map<string, any>;
  private loading: Map<string, Promise<any>>;

  constructor() {
    this.cache = new Map();
    this.loading = new Map();
  }

  async load(url: string, type: 'texture' | 'model' | 'json'): Promise<any> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    if (this.loading.has(url)) {
      return this.loading.get(url);
    }

    const loadPromise = this.loadResource(url, type);
    this.loading.set(url, loadPromise);

    try {
      const resource = await loadPromise;
      this.cache.set(url, resource);
      this.loading.delete(url);
      return resource;
    } catch (error) {
      this.loading.delete(url);
      throw error;
    }
  }

  private async loadResource(url: string, type: string): Promise<any> {
    switch (type) {
      case 'texture':
        return new TextureLoader().loadAsync(url);
      case 'model':
        const loader = new GLTFLoader();
        return loader.loadAsync(url);
      case 'json':
        const response = await fetch(url);
        return response.json();
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }
}
```

## 3. Event System Fix

### Add Event Bus
```typescript
// src/core/EventBus.ts
export class EventBus {
  private events: Map<string, Set<Function>>;

  constructor() {
    this.events = new Map();
  }

  on(event: string, handler: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)?.add(handler);
  }

  off(event: string, handler: Function): void {
    this.events.get(event)?.delete(handler);
  }

  emit(event: string, ...args: any[]): void {
    this.events.get(event)?.forEach(handler => handler(...args));
  }
}
```

## Implementation Order

1. **Scene Initialization (Day 1)**
   - Update App component
   - Fix Earth scene
   - Add loading and error screens

2. **Resource Management (Day 2)**
   - Implement ResourceManager
   - Add texture loading
   - Add model loading

3. **Event System (Day 3)**
   - Implement EventBus
   - Connect components
   - Add debug overlay

4. **Testing and Optimization (Day 4)**
   - Add unit tests
   - Performance testing
   - Bug fixes

## Success Criteria

1. Scene renders properly with Earth and network
2. Resources load without errors
3. Events propagate correctly
4. UI components show proper state
5. Performance meets targets (60 FPS)
6. No console errors