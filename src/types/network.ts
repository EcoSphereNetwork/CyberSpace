export interface NetworkNode {
  id: string;
  label: string;
  type: string;
  status: "online" | "offline" | "warning" | "error";
  color?: string;
  size?: number;
  metadata?: Record<string, any>;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  type: string;
  status: "online" | "offline" | "warning" | "error";
  label?: string;
  color?: string;
  width?: number;
  metadata?: Record<string, any>;
}

export interface NetworkGraphData {
  nodes: NetworkNode[];
  links: NetworkLink[];
  filters?: {
    activeNodes: boolean;
    criticalPaths: boolean;
    warnings: boolean;
    errors: boolean;
  };
  search?: string;
}
