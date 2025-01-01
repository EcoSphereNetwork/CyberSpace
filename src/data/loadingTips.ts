export interface LoadingTip {
  id: string;
  text: string;
  category: 'navigation' | 'interaction' | 'features' | 'shortcuts' | 'tips';
}

export const loadingTips: LoadingTip[] = [
  {
    id: 'nav_1',
    text: 'Use the mouse wheel to zoom in and out of the scene',
    category: 'navigation',
  },
  {
    id: 'nav_2',
    text: 'Click and drag to rotate the view',
    category: 'navigation',
  },
  {
    id: 'nav_3',
    text: 'Hold Shift while dragging to pan the view',
    category: 'navigation',
  },
  {
    id: 'int_1',
    text: 'Double-click on nodes to inspect their details',
    category: 'interaction',
  },
  {
    id: 'int_2',
    text: 'Hover over connections to see network traffic',
    category: 'interaction',
  },
  {
    id: 'int_3',
    text: 'Right-click on objects to open the context menu',
    category: 'interaction',
  },
  {
    id: 'feat_1',
    text: 'Enable VR mode for an immersive experience',
    category: 'features',
  },
  {
    id: 'feat_2',
    text: 'Use the plugin system to extend functionality',
    category: 'features',
  },
  {
    id: 'feat_3',
    text: 'Switch between different visualization layers',
    category: 'features',
  },
  {
    id: 'short_1',
    text: 'Press Space to reset the camera view',
    category: 'shortcuts',
  },
  {
    id: 'short_2',
    text: 'Press F to focus on selected objects',
    category: 'shortcuts',
  },
  {
    id: 'short_3',
    text: 'Press H to toggle the UI overlay',
    category: 'shortcuts',
  },
  {
    id: 'tip_1',
    text: 'Use the debug overlay to monitor performance',
    category: 'tips',
  },
  {
    id: 'tip_2',
    text: 'Save custom layouts for quick access',
    category: 'tips',
  },
  {
    id: 'tip_3',
    text: 'Check the documentation for advanced features',
    category: 'tips',
  },
];

export function getRandomTip(category?: string): LoadingTip {
  const tips = category
    ? loadingTips.filter(tip => tip.category === category)
    : loadingTips;
  return tips[Math.floor(Math.random() * tips.length)];
}

export function getTipsByCategory(category: string): LoadingTip[] {
  return loadingTips.filter(tip => tip.category === category);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(loadingTips.map(tip => tip.category)));
}
