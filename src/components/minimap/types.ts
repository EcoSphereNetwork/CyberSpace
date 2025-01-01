export interface Point {
  x: number;
  y: number;
}

export interface Region extends Point {
  width: number;
  height: number;
  color?: string;
  label?: string;
  metadata?: Record<string, any>;
}

export interface Marker extends Point {
  color?: string;
  label?: string;
  metadata?: Record<string, any>;
}
