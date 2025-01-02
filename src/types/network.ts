export interface NetworkNode {
  id: string;
  label?: string;
  type: string;
  status?: 'active' | 'warning' | 'error';
  color?: string;
  size?: number;
  level?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  highlighted?: boolean;
  selected?: boolean;
  clusterId?: string;
  metadata?: {
    ip?: string;
    uptime?: string;
    load?: string;
    [key: string]: any;
  };
}

export interface NetworkLink {
  id: string;
  source: string | NetworkNode;
  target: string | NetworkNode;
  type: string;
  label?: string;
  color?: string;
  width?: number;
  highlighted?: boolean;
  metadata?: {
    bandwidth?: string;
    latency?: string;
    [key: string]: any;
  };
}

export interface NetworkCluster {
  id: string;
  label: string;
  nodes: string[];
  x?: number;
  y?: number;
  radius?: number;
  color?: string;
  type?: string;
  size?: number;
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
