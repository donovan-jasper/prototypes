import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://open-api.tiktok.com';
const CLIENT_KEY = 'your-tiktok-client-key';
const CLIENT_SECRET = 'your-tiktok-client-secret';

interface TikTokProduct {
  product_id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  inventory: number;
  category_id: string;
  brand: string;
}

interface TikTokResponse {
  code: number;
  message: string;
  data?: any;
}

export const formatProductForTikTok = (product: any): TikTokProduct => {
  return {
    product_id: product.id || `syncsell-${Date.now()}`,
    title: product.title,
    description: product.description || '',
    price: parseFloat(product.price),
    image_url: product.imageUri,
    inventory: parseInt(product.inventory),
    category_id: '12345', // Default category ID
    brand: 'SyncSell'
  };
};

export const postProduct = async (product: any, apiKey: string): Promise<TikTokResponse> => {
  try {
    const formattedProduct = formatProductForTikTok(product);

    // Mock API call for development
    console.log('Mock TikTok API call:', formattedProduct);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate successful response
    return {
      code: 0,
      message: 'Success',
      data: {
        product_id: formattedProduct.product_id,
        status: 'published'
      }
    };
  } catch (error) {
    console.error('Error posting product to TikTok:', error);
    throw error;
  }
};

export const fetchMessages = async (apiKey: string): Promise<TikTokResponse> => {
  try {
    // Mock API call for development
    console.log('Mock TikTok fetch messages call');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate successful response
    return {
      code: 0,
      message: 'Success',
      data: {
        messages: [
          {
            id: 'msg1',
            from: 'buyer1',
            message: 'Hi, is this still available?',
            timestamp: Date.now() - 3600000
          },
          {
            id: 'msg2',
            from: 'buyer2',
            message: 'When will this ship?',
            timestamp: Date.now() - 7200000
          }
        ]
      }
    };
  } catch (error) {
    console.error('Error fetching messages from TikTok:', error);
    throw error;
  }
};

export const recordSale = async (productId: string, apiKey: string, amount: number): Promise<TikTokResponse> => {
  try {
    // Mock API call for development
    console.log(`Mock TikTok record sale call for product ${productId}: $${amount}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate successful response
    return {
      code: 0,
      message: 'Success',
      data: {
        order_id: `order-${Date.now()}`,
        status: 'completed'
      }
    };
  } catch (error) {
    console.error('Error recording sale on TikTok:', error);
    throw error;
  }
};

export const handleTikTokError = (error: any): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid product data. Please check your product details.';
      case 401:
        return 'Authentication failed. Please reconnect your TikTok account.';
      case 403:
        return 'You don\'t have permission to post products.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'TikTok server error. Please try again later.';
      default:
        return 'Failed to post product to TikTok. Please try again.';
    }
  }
  return 'Network error. Please check your internet connection.';
};

export const retryPostProduct = async (product: any, apiKey: string, maxRetries = 3, delay = 1000): Promise<TikTokResponse> => {
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await postProduct(product, apiKey);
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};
