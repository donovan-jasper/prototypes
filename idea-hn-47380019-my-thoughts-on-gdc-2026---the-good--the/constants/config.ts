import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_KEY_STORAGE = '@credigen_openai_key';
const ANTHROPIC_KEY_STORAGE = '@credigen_anthropic_key';

export const API_CONFIG = {
  getOpenAIKey: async () => {
    const key = await AsyncStorage.getItem(OPENAI_KEY_STORAGE);
    return key?.trim() || '';
  },
  getAnthropicKey: async () => {
    const key = await AsyncStorage.getItem(ANTHROPIC_KEY_STORAGE);
    return key?.trim() || '';
  },
  FREE_GENERATION_LIMIT: 10,
  PREMIUM_PRICE: 9.99,
  ARTIST_TIP_FEE: 0.15,
  ARTIST_TIP_FEE_PREMIUM: 0.10
};

export const APP_ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  PROFILE: '/profile',
  REGISTRY: '/registry',
  GENERATION_DETAIL: '/generation/[id]'
};
