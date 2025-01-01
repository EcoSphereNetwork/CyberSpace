interface ResourceRequest {
  url: string;
  type: 'texture' | 'model' | 'audio' | 'json';
  id: string;
}

interface ResourceResponse {
  id: string;
  url: string;
  type: string;
  status: 'success' | 'error';
  data?: ArrayBuffer;
  error?: string;
}

self.onmessage = async (event: MessageEvent<ResourceRequest>) => {
  const { url, type, id } = event.data;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();

    const result: ResourceResponse = {
      id,
      url,
      type,
      status: 'success',
      data: buffer,
    };

    self.postMessage(result, [buffer]);
  } catch (error) {
    const result: ResourceResponse = {
      id,
      url,
      type,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    self.postMessage(result);
  }
};
