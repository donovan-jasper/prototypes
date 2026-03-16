import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStore } from '../store/useStore';

const queueChange = async (operation) => {
  const queue = JSON.parse(await AsyncStorage.getItem('syncQueue')) || [];
  queue.push(operation);
  await AsyncStorage.setItem('syncQueue', JSON.stringify(queue));
};

const processSyncQueue = async () => {
  const queue = JSON.parse(await AsyncStorage.getItem('syncQueue')) || [];
  if (queue.length === 0) return;

  // Process queue (simplified for prototype)
  await AsyncStorage.setItem('syncQueue', JSON.stringify([]));
};

export { queueChange, processSyncQueue };
