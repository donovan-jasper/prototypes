import axios from 'axios';

class KubernetesAPI {
  constructor() {
    this.baseURL = process.env.KUBERNETES_API_URL || 'https://your-kubernetes-api-endpoint';
    this.token = process.env.KUBERNETES_API_TOKEN || 'your-api-token';
    this.ws = null;
    this.currentCpu = 50;
    this.currentMemory = 60;
    this.currentDisk = 70;
    this.callback = null;
    this.errorCallback = null;
    this.wsEndpoint = process.env.KUBERNETES_WS_ENDPOINT || 'ws://your-kubernetes-ws-endpoint';
  }

  async fetchMetrics() {
    try {
      const response = await axios.get(`${this.baseURL}/apis/metrics.k8s.io/v1beta1/nodes`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.data && response.data.items && response.data.items.length > 0) {
        const nodeMetrics = response.data.items[0];
        const cpuUsage = this.calculateCpuUsage(nodeMetrics);
        const memoryUsage = this.calculateMemoryUsage(nodeMetrics);
        const diskUsage = await this.calculateDiskUsage();

        return {
          cpu: cpuUsage,
          memory: memoryUsage,
          disk: diskUsage
        };
      }

      return {
        cpu: this.currentCpu,
        memory: this.currentMemory,
        disk: this.currentDisk
      };
    } catch (error) {
      console.error('Error fetching Kubernetes metrics:', error);
      throw error; // Re-throw the error to be handled by the component
    }
  }

  calculateCpuUsage(nodeMetrics) {
    if (!nodeMetrics || !nodeMetrics.usage || !nodeMetrics.usage.cpu) {
      return this.currentCpu;
    }

    const cpuValue = nodeMetrics.usage.cpu;
    const cpuCores = parseInt(cpuValue) / 1000000000;
    // Get node capacity from metrics
    const capacity = nodeMetrics.usage.capacity?.cpu || '8000000000'; // Default to 8 cores
    const totalCores = parseInt(capacity) / 1000000000;
    const cpuPercentage = (cpuCores / totalCores) * 100;
    return Math.min(100, Math.max(0, Math.round(cpuPercentage)));
  }

  calculateMemoryUsage(nodeMetrics) {
    if (!nodeMetrics || !nodeMetrics.usage || !nodeMetrics.usage.memory) {
      return this.currentMemory;
    }

    const memoryValue = nodeMetrics.usage.memory;
    const memoryGB = parseInt(memoryValue) / (1024 * 1024 * 1024);
    const capacity = nodeMetrics.usage.capacity?.memory || '32212254720'; // Default to 32GB
    const totalGB = parseInt(capacity) / (1024 * 1024 * 1024);
    const memoryPercentage = (memoryGB / totalGB) * 100;
    return Math.min(100, Math.max(0, Math.round(memoryPercentage)));
  }

  async calculateDiskUsage() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/nodes`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (response.data && response.data.items && response.data.items.length > 0) {
        const node = response.data.items[0];
        const fsStats = node.status?.nodeInfo?.fsStats || {};
        const total = fsStats.total || 0;
        const used = fsStats.used || 0;

        if (total > 0) {
          return Math.min(100, Math.max(0, Math.round((used / total) * 100)));
        }
      }
      return this.currentDisk;
    } catch (error) {
      console.error('Error fetching disk metrics:', error);
      throw error; // Re-throw the error to be handled by the component
    }
  }

  subscribeToMetrics(endpoint, callback, errorCallback) {
    this.callback = callback;
    this.errorCallback = errorCallback;

    // Use the configured WebSocket endpoint
    const wsEndpoint = this.wsEndpoint || endpoint;

    // Close existing connection if it exists
    if (this.ws) {
      this.ws.close();
    }

    this.ws = new WebSocket(wsEndpoint);

    this.ws.onmessage = (event) => {
      try {
        const metrics = JSON.parse(event.data);
        this.currentCpu = metrics.cpu || this.currentCpu;
        this.currentMemory = metrics.memory || this.currentMemory;
        this.currentDisk = metrics.disk || this.currentDisk;

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
      if (this.errorCallback) {
        this.errorCallback(event);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      if (this.errorCallback) {
        this.errorCallback(new Error('WebSocket connection closed'));
      }
    };

    return () => {
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
    };
  }
}

export const kubernetesAPI = new KubernetesAPI();
