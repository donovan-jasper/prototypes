export const getAppStoreData = async (appId: string) => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: appId,
        name: `App ${appId.split('.').pop()}`,
        sales: Math.floor(Math.random() * 1000),
        ratings: (Math.random() * 5).toFixed(1),
        salesData: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          sales: Math.floor(Math.random() * 100),
        })),
      });
    }, 1000);
  });
};

export const getAppStoreReviews = async (appId: string) => {
  // Mock API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Array.from({ length: 10 }, (_, i) => ({
        id: `${appId}-review-${i}`,
        title: `Review ${i + 1}`,
        body: `This is a sample review for ${appId}.`,
        rating: Math.floor(Math.random() * 5) + 1,
      })));
    }, 1000);
  });
};
