export const submitPaperToServer = async (paperData) => {
  // This would be replaced with actual API call to your backend
  // For now, we'll simulate a successful submission
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
};
