import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { useAlertStore } from '../stores/alertStore';
import { fetchItemPrice } from '../api/priceService';
import { getItemsFromDB } from '../db';

const BACKGROUND_FETCH_TASK = 'background-price-check';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Get all items from the database
    const items = await getItemsFromDB();

    // Create a map of current prices
    const currentPrices: Record<string, number> = {};

    // Fetch prices for all items
    await Promise.all(
      items.map(async (item) => {
        try {
          const price = await fetchItemPrice(item.game, item.id);
          currentPrices[`${item.game}-${item.name}`] = price;
        } catch (error) {
          console.error(`Error fetching price for ${item.name}:`, error);
        }
      })
    );

    // Check alert rules with current prices
    const alertStore = useAlertStore.getState();
    await alertStore.checkRules(currentPrices);

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error in background task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundFetch = async (isPremiumUser: boolean) => {
  try {
    // Set the interval based on user type
    const intervalMinutes = isPremiumUser ? 15 : 6 * 60; // 15 minutes for premium, 6 hours for free

    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: intervalMinutes * 60, // Convert to seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });

    console.log('Background fetch task registered with interval:', intervalMinutes, 'minutes');
  } catch (error) {
    console.error('Error registering background fetch task:', error);
  }
};

export const unregisterBackgroundFetch = async () => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch task unregistered');
  } catch (error) {
    console.error('Error unregistering background fetch task:', error);
  }
};
