export const formatSystemMetrics = (metrics) => {
  return {
    cpu: metrics.cpu,
    memory: metrics.memory,
    disk: metrics.disk,
  };
};
