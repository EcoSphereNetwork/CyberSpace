export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isMinimized: boolean;
  zIndex: number;
}

export type PluginStatus = "available" | "installed" | "active" | "inactive" | "error";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  icon?: string;
  status: PluginStatus;
  dependencies?: string[];
  permissions?: string[];
  config?: Record<string, any>;
}

export interface PluginConfig {
  id: string;
  name: string;
  description?: string;
  type: "string" | "number" | "boolean" | "select" | "multiselect";
  default?: any;
  options?: { label: string; value: any }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
}
