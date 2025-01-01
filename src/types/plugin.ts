export type PluginStatus = "active" | "inactive" | "error" | "updating";

export interface Plugin {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  enabled: boolean;
  status: PluginStatus;
}
