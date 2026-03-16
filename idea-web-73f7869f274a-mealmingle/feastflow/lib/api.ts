export const fetchDeliveryStatus = async (orderId) => {
  // Mock API call
  const statuses = ['ordered', 'preparing', 'picked_up', 'out_for_delivery', 'delivered'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  return {
    status: randomStatus,
    driverLocation: {
      latitude: 37.78825 + (Math.random() - 0.5) * 0.1,
      longitude: -122.4324 + (Math.random() - 0.5) * 0.1,
    },
  };
};
