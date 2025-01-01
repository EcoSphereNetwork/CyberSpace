export interface Point {
  x: number;
  y: number;
}

export interface Region extends Point {
  id?: string;
  width: number;
  height: number;
  color?: string;
  label?: string;
  type?: 'zone' | 'area' | 'room';
  status?: 'active' | 'inactive' | 'warning' | 'error';
  metadata?: Record<string, any>;
}

export interface Marker extends Point {
  id?: string;
  color?: string;
  label?: string;
  type?: 'user' | 'resource' | 'event' | 'alert';
  status?: 'online' | 'offline' | 'busy' | 'warning' | 'error';
  connections?: string[];
  metadata?: Record<string, any>;
}

export interface MinimapStyle {
  backgroundColor?: string;
  gridColor?: string;
  borderColor?: string;
  regionFillOpacity?: number;
  markerGlowIntensity?: number;
  connectionOpacity?: number;
  labelFontFamily?: string;
  labelFontSize?: number;
}

export interface MinimapViewport {
  x: number;
  y: number;
  width: number;
  height: number;
  zoom: number;
}

export interface MinimapInteraction {
  isDragging: boolean;
  isZooming: boolean;
  selectedRegion?: Region;
  selectedMarker?: Marker;
  hoveredRegion?: Region;
  hoveredMarker?: Marker;
}
