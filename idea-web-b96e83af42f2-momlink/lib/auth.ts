import * as SecureStore from 'expo-secure-store';

const USER_ID_KEY = 'user_id';

export async function saveUserId(userId: string): Promise<void> {
  await SecureStore.setItemAsync(USER_ID_KEY, userId);
}

export async function getUserId(): Promise<string | null> {
  return await SecureStore.getItemAsync(USER_ID_KEY);
}

export async function clearUserId(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_ID_KEY);
}
