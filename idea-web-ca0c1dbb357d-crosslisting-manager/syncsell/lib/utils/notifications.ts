import * as Notifications from 'expo-notifications';

export const setupNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    console.log('Notification permissions not granted');
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const sendSaleNotification = async (product, platform, amount) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'New Sale!',
      body: `You made $${amount} from ${product.title} on ${platform}`,
      data: { productId: product.id, platform },
    },
    trigger: null,
  });
};

export const sendInventoryAlert = async (product) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Low Inventory Alert',
      body: `You have ${product.inventory} left of ${product.title}`,
      data: { productId: product.id },
    },
    trigger: null,
  });
};
