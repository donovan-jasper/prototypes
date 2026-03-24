export const processNotification = (rawNotification) => {
  // Extract key information from the notification
  const notificationData = {
    app: rawNotification.request?.content?.data?.appName || 'Unknown App',
    title: rawNotification.request?.content?.title || '',
    body: rawNotification.request?.content?.body || '',
    timestamp: Date.now(),
    raw: rawNotification
  };

  return notificationData;
};
