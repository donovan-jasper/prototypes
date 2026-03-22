class KubernetesAPI {
  constructor() {
    this.ws = null;
    this.currentCpu = 50;
    this.currentMemory = 60;
    this.currentDisk = 70;
    this.callback = null;
  }

  /**
   * Establishes a WebSocket connection to the specified endpoint.
   * @param {string} endpoint The WebSocket endpoint URL.
   * @param {(metrics: { cpu: number, memory: number, disk: number }) => void} callback
   *   The function to call with new metric data.
   * @returns {() => void} A function to unsubscribe (close the WebSocket connection).
   */
  subscribeToMetrics(endpoint, callback) {
    this.callback = callback;

    this.ws = new WebSocket(endpoint);

    this.ws.onmessage = (event) => {
      try {
        const metrics = JSON.parse(event.data);
        this.currentCpu = metrics.cpu;
        this.currentMemory = metrics.memory;
        this.currentDisk = metrics.disk;

        callback({
          cpu: this.currentCpu,
          memory: this.currentMemory,
          disk: this.currentDisk,
        });
      } catch (error) {
        console.log('Error parsing WebSocket message:', error);
      }
    };

    this.ws.onopen = () => {
      callback({
        cpu: this.currentCpu,
        memory: this.currentMemory,
        disk: this.currentDisk,
      });
    };

    this.ws.onerror = (event) => {
      console.log('Error occurred while connecting to WebSocket:', event);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    // Return a cleanup function to stop the WebSocket connection
    return () => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }
}

// Export a singleton instance of the KubernetesAPI
export const kubernetesAPI = new KubernetesAPI();
