import { Vector3 } from 'three';
import { SceneConfig } from '../SceneManager';

/**
 * Example scene configurations
 */
export const ExampleScenes: SceneConfig[] = [
  // Default scene
  {
    id: 'default',
    preset: 'default',
    camera: {
      position: new Vector3(0, 10, 20),
      target: new Vector3(0, 0, 0),
      fov: 75,
    },
    controls: {
      enabled: true,
      autoRotate: false,
      enableDamping: true,
    },
    onEnter: () => {
      console.log('Entered default scene');
    },
  },

  // Data visualization scene
  {
    id: 'dataViz',
    preset: 'dataViz',
    camera: {
      position: new Vector3(0, 5, 10),
      target: new Vector3(0, 0, 0),
      fov: 60,
    },
    controls: {
      enabled: true,
      autoRotate: true,
      enableDamping: true,
    },
    onEnter: () => {
      // Start data updates
      console.log('Starting data visualization');
    },
    onLeave: () => {
      // Cleanup data updates
      console.log('Stopping data visualization');
    },
  },

  // VR environment scene
  {
    id: 'vrWorld',
    preset: 'vr',
    camera: {
      position: new Vector3(0, 2, 0),
      target: new Vector3(0, 2, -1),
      fov: 90,
    },
    controls: {
      enabled: false, // VR controls will be used instead
    },
    onEnter: () => {
      // Initialize VR
      console.log('Entering VR mode');
    },
    onLeave: () => {
      // Cleanup VR
      console.log('Exiting VR mode');
    },
  },

  // Night scene
  {
    id: 'night',
    preset: 'night',
    camera: {
      position: new Vector3(0, 15, 30),
      target: new Vector3(0, 0, 0),
      fov: 70,
    },
    controls: {
      enabled: true,
      autoRotate: true,
      enableDamping: true,
    },
    onEnter: () => {
      // Start night cycle
      console.log('Starting night cycle');
    },
  },

  // Storm scene
  {
    id: 'storm',
    preset: 'storm',
    camera: {
      position: new Vector3(0, 20, 40),
      target: new Vector3(0, 0, 0),
      fov: 65,
    },
    controls: {
      enabled: true,
      autoRotate: false,
      enableDamping: true,
    },
    onEnter: () => {
      // Start storm effects
      console.log('Storm approaching');
    },
    onLeave: () => {
      // Cleanup storm effects
      console.log('Storm passing');
    },
  },
];
