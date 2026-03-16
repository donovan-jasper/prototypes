import Constants from 'expo-constants';

export const API_CONFIG = {
  OPENAI_API_KEY: Constants.expoConfig?.extra?.openaiApiKey || '',
  ANTHROPIC_API_KEY: Constants.expoConfig?.extra?.anthropicApiKey || '',
  FREE_GENERATION_LIMIT: 10,
  PREMIUM_PRICE: 9.99,
  ARTIST_TIP_FEE: 0.15, // 15% fee for artist tips
  ARTIST_TIP_FEE_PREMIUM: 0.10 // 10% fee for premium users
};

export const APP_ROUTES = {
  HOME: '/',
  LIBRARY: '/library',
  PROFILE: '/profile',
  REGISTRY: '/registry',
  GENERATION_DETAIL: '/generation/[id]'
};
