import axios from 'axios';
import { webSocketService } from './WebSocketService';

class KubernetesAPI {
  constructor() {
    this.baseURL = process.env.KUBERNETES_API_URL || 'https://your-kubernetes-api-endpoint';
    this.token = process.env.KUBERNETES_API_TOKEN || 'your-api-token';
    this.currentCpu = 50;
    this.currentMemory = 60;
    this.currentDisk = 70;
    this.callback = null;
    this.errorCallback = null;
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
      throw error;
    }
  }

  calculateCpuUsage(nodeMetrics) {
    if (!nodeMetrics || !nodeMetrics.usage || !nodeMetrics.usage.cpu) {
      return this.currentCpu;
    }

    const cpuValue = nodeMetrics.usage.cpu;
    const cpuCores = parseInt(cpuValue) / 1000000000;
    const capacity = nodeMetrics.usage.capacity?.cpu || '8000000000';
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
    const capacity = nodeMetrics.usage.capacity?.memory || '32212254720';
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
      throw error;
    }
  }

  subscribeToMetrics(callback, errorCallback) {
    this.callback = callback;
    this.errorCallback = errorCallback;

    webSocketService.connect(
      (data) => {
        this.currentCpu = data.cpu || this.currentCpu;
        this.currentMemory = data.memory || this.currentMemory;
        this.currentDisk = data.disk || this.currentDisk;

        if (this.callback) {
          this.callback({
            cpu: this.currentCpu,
            memory: this.currentMemory,
            disk: this.currentDisk,
          });
        }
      },
      (error) => {
        console.error('WebSocket error:', error);
        if (this.errorCallback) {
          this.errorCallback(error);
        }
      }
    );

    return () => {
      webSocketService.disconnect();
    };
  }
}

export const kubernetesAPI = new KubernetesAPI();
