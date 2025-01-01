export interface NetworkNode {
  id: string;
  type: string;
  label?: string;
  color?: string;
  size?: number;
  status?: string;
  data?: any;
}

export interface NetworkLink {
  source: string;
  target: string;
  type: string;
  label?: string;
  color?: string;
  width?: number;
  directed?: boolean;
  value?: number;
  data?: any;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export type NetworkViewMode = "2d" | "3d";

export interface NetworkStats {
  nodeCount: number;
  linkCount: number;
  nodeTypes: { [type: string]: number };
  linkTypes: { [type: string]: number };
}

export interface NetworkFilter {
  nodeTypes?: string[];
  linkTypes?: string[];
  nodeStatus?: string[];
  minValue?: number;
  maxValue?: number;
  searchQuery?: string;
}
