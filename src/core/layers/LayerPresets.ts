import { LayerConfig } from './Layer';
import { Vector2, Vector3 } from 'three';

/**
 * Common layer presets for different scenarios
 */
export const LayerPresets = {
  // Default environment preset
  default: {
    id: 'default',
    layers: [
      {
        id: 'terrain',
        config: {
          terrain: {
            size: new Vector2(1000, 1000),
            segments: new Vector2(100, 100),
            heightScale: 100,
            roughness: 1.5,
          },
          lighting: {
            ambient: {
              color: 0x404040,
              intensity: 0.5,
            },
            sun: {
              color: 0xffffff,
              intensity: 1,
              position: new Vector3(100, 100, 0),
            },
          },
        },
      },
      {
        id: 'weather',
        config: {
          effects: [
            {
              type: 'clouds',
              intensity: 0.3,
              color: 0xffffff,
            },
          ],
          wind: new Vector3(1, 0, 1),
        },
      },
      {
        id: 'ui',
        config: {
          elements: [
            {
              id: 'hud',
              type: 'hud',
              position: new Vector3(0, 0, 0),
              content: 'Default HUD',
            },
          ],
        },
      },
    ],
    groups: [
      {
        id: 'environment',
        layers: ['terrain', 'weather'],
        active: true,
        blend: {
          mode: 'screen',
          opacity: 0.8,
        },
      },
      {
        id: 'interface',
        layers: ['ui'],
        active: true,
      },
    ],
    transition: {
      duration: 2,
      easing: 'power2.inOut',
      type: 'fade',
    },
  },

  // Data visualization preset
  dataViz: {
    id: 'dataViz',
    layers: [
      {
        id: 'data',
        config: {
          points: [
            {
              id: 'node1',
              position: new Vector3(0, 0, 0),
              value: 1,
              color: 0x00ff00,
            },
          ],
          connections: [
            {
              id: 'conn1',
              from: 'node1',
              to: 'node2',
              value: 0.5,
              animated: true,
            },
          ],
        },
      },
      {
        id: 'ui',
        config: {
          elements: [
            {
              id: 'dataPanel',
              type: 'panel',
              position: new Vector3(1, 1, 0),
              content: 'Data Visualization',
            },
          ],
        },
      },
    ],
    groups: [
      {
        id: 'visualization',
        layers: ['data', 'ui'],
        active: true,
        transition: {
          type: 'zoom',
          duration: 1,
        },
      },
    ],
  },

  // VR environment preset
  vr: {
    id: 'vr',
    layers: [
      {
        id: 'terrain',
        config: {
          terrain: {
            size: new Vector2(2000, 2000),
            segments: new Vector2(200, 200),
            heightScale: 200,
            roughness: 2,
          },
          vegetation: [
            {
              type: 'tree',
              density: 0.01,
              scale: new Vector3(1, 2, 1),
            },
            {
              type: 'grass',
              density: 0.1,
              scale: new Vector3(0.5, 1, 0.5),
            },
          ],
        },
      },
      {
        id: 'weather',
        config: {
          effects: [
            {
              type: 'clouds',
              intensity: 0.5,
            },
            {
              type: 'fog',
              intensity: 0.2,
            },
          ],
        },
      },
      {
        id: 'ui',
        config: {
          elements: [
            {
              id: 'vrControls',
              type: 'custom',
              position: new Vector3(0, 1, -2),
              content: 'VR Controls',
            },
          ],
        },
      },
    ],
    groups: [
      {
        id: 'environment',
        layers: ['terrain', 'weather'],
        active: true,
        blend: {
          mode: 'screen',
          opacity: 0.9,
        },
      },
      {
        id: 'interface',
        layers: ['ui'],
        active: true,
        transition: {
          type: 'fade',
          duration: 0.5,
        },
      },
    ],
  },

  // Night environment preset
  night: {
    id: 'night',
    layers: [
      {
        id: 'terrain',
        config: {
          terrain: {
            size: new Vector2(1000, 1000),
            segments: new Vector2(100, 100),
          },
          lighting: {
            ambient: {
              color: 0x001133,
              intensity: 0.2,
            },
            sun: {
              color: 0x0044ff,
              intensity: 0.1,
              position: new Vector3(-100, -50, 0),
            },
          },
        },
      },
      {
        id: 'weather',
        config: {
          effects: [
            {
              type: 'stars',
              intensity: 1,
            },
            {
              type: 'clouds',
              intensity: 0.2,
              color: 0x222244,
            },
          ],
        },
      },
      {
        id: 'data',
        config: {
          points: [],
          flows: [
            {
              id: 'flow1',
              path: [new Vector3(0, 10, 0), new Vector3(10, 15, 10)],
              color: 0x00ffff,
              speed: 0.5,
            },
          ],
        },
      },
    ],
    groups: [
      {
        id: 'environment',
        layers: ['terrain', 'weather'],
        active: true,
        blend: {
          mode: 'screen',
          opacity: 1,
        },
      },
      {
        id: 'data',
        layers: ['data'],
        active: true,
        blend: {
          mode: 'add',
          opacity: 0.8,
        },
      },
    ],
    transition: {
      duration: 3,
      easing: 'power2.inOut',
      type: 'fade',
    },
  },

  // Storm environment preset
  storm: {
    id: 'storm',
    layers: [
      {
        id: 'terrain',
        config: {
          terrain: {
            size: new Vector2(1000, 1000),
            segments: new Vector2(100, 100),
          },
          lighting: {
            ambient: {
              color: 0x222222,
              intensity: 0.3,
            },
            sun: {
              color: 0x666666,
              intensity: 0.4,
              position: new Vector3(0, 100, 0),
            },
          },
        },
      },
      {
        id: 'weather',
        config: {
          effects: [
            {
              type: 'rain',
              intensity: 1,
            },
            {
              type: 'clouds',
              intensity: 0.9,
              color: 0x333333,
            },
            {
              type: 'lightning',
              intensity: 0.7,
            },
          ],
          wind: new Vector3(5, 0, 5),
        },
      },
      {
        id: 'ui',
        config: {
          elements: [
            {
              id: 'warning',
              type: 'panel',
              position: new Vector3(0, 2, 0),
              content: 'Storm Warning',
            },
          ],
        },
      },
    ],
    groups: [
      {
        id: 'environment',
        layers: ['terrain', 'weather'],
        active: true,
        blend: {
          mode: 'multiply',
          opacity: 1,
        },
      },
      {
        id: 'interface',
        layers: ['ui'],
        active: true,
        transition: {
          type: 'fade',
          duration: 0.3,
        },
      },
    ],
    transition: {
      duration: 2,
      easing: 'power3.inOut',
      type: 'fade',
    },
  },
};
