interface ResourceBundle {
  id: string;
  name: string;
  description?: string;
  priority: number;
  resources: Array<{
    url: string;
    type: string;
    priority: number;
    size: number;
    required: boolean;
  }>;
  dependencies: string[];
  metadata?: Record<string, any>;
}

interface LoadBundleMessage {
  type: 'loadBundle';
  data: {
    bundle: ResourceBundle;
    force: boolean;
  };
}

type WorkerMessage = LoadBundleMessage;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, data } = event.data;

  switch (type) {
    case 'loadBundle':
      await loadBundle(data.bundle);
      break;
  }
};

async function loadBundle(bundle: ResourceBundle): Promise<void> {
  const { id, resources } = bundle;

  // Sort resources by priority
  const sortedResources = [...resources].sort((a, b) => a.priority - b.priority);

  let loadedSize = 0;
  const totalSize = resources.reduce((sum, r) => sum + r.size, 0);

  // Load each resource
  for (const resource of sortedResources) {
    try {
      // Report progress
      self.postMessage({
        type: 'progress',
        data: {
          bundleId: id,
          loaded: loadedSize,
          total: totalSize,
          percentage: (loadedSize / totalSize) * 100,
          currentItem: resource.url,
        },
      });

      // Load resource
      await loadResource(resource);

      // Update progress
      loadedSize += resource.size;
      self.postMessage({
        type: 'progress',
        data: {
          bundleId: id,
          loaded: loadedSize,
          total: totalSize,
          percentage: (loadedSize / totalSize) * 100,
          currentItem: resource.url,
        },
      });
    } catch (error) {
      if (resource.required) {
        // Required resource failed to load
        self.postMessage({
          type: 'error',
          data: {
            bundleId: id,
            error: `Failed to load required resource ${resource.url}: ${error}`,
          },
        });
        return;
      } else {
        // Optional resource failed to load, continue with next
        console.warn(`Failed to load optional resource ${resource.url}:`, error);
        continue;
      }
    }
  }

  // Bundle loaded successfully
  self.postMessage({
    type: 'complete',
    data: {
      bundleId: id,
    },
  });
}

async function loadResource(resource: ResourceBundle['resources'][0]): Promise<ArrayBuffer> {
  const response = await fetch(resource.url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.arrayBuffer();
}