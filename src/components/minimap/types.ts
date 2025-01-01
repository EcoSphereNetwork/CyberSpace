export interface Point {
  x: number;
  y: number;
}

export interface Marker extends Point {
  id: string;
  label?: string;
  tooltip?: string;
  icon?: string;
  color?: string;
  data?: any;
}

export interface Region extends Point {
  id: string;
  width: number;
  height: number;
  label?: string;
  tooltip?: string;
  color?: string;
  data?: any;
}
