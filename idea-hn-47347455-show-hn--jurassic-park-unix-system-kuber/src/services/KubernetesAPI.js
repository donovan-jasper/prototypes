class KubernetesAPI {
  constructor() {
    // Initial mock values for metrics
    this.currentCpu = 50;
    this.currentMemory = 60;
    this.currentDisk = 70;
  }

  /**
   * Generates a mock metric value that fluctuates slightly around its current value.
   * Clamps the value between 0 and 100.
   * @param {number} currentValue The current metric value.
   * @returns {number} The new, slightly adjusted metric value.
   */
  _generateMockMetric(currentValue) {
    const change = Math.floor(Math.random() * 11) - 5; // Generates a random integer between -5 and +5
    let newValue = currentValue + change;
    return Math.max(0, Math.min(100, newValue)); // Clamp between 0 and 100
  }

  /**
   * Subscribes to real-time system metrics.
   * Emits mock CPU, Memory, and Disk data at regular intervals.
   * @param {(metrics: { cpu: number, memory: number, disk: number }) => void} callback
   *   The function to call with new metric data.
   * @returns {() => void} A function to unsubscribe (clear the interval).
   */
  subscribeToMetrics(callback) {
    // Immediately call the callback with initial values
    callback({
      cpu: this.currentCpu,
      memory: this.currentMemory,
      disk: this.currentDisk,
    });

    const intervalId = setInterval(() => {
      this.currentCpu = this._generateMockMetric(this.currentCpu);
      this.currentMemory = this._generateMockMetric(this.currentMemory);
      this.currentDisk = this._generateMockMetric(this.currentDisk);

      callback({
        cpu: this.currentCpu,
        memory: this.currentMemory,
        disk: this.currentDisk,
      });
    }, 1000); // Update every 1 second

    // Return a cleanup function to stop the interval
    return () => {
      clearInterval(intervalId);
    };
  }
}

// Export a singleton instance of the KubernetesAPI
export const kubernetesAPI = new KubernetesAPI();
