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

    const response = await axios.post(`${API_BASE_URL}/product/create`, formattedProduct, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-TikTok-Client-Key': CLIENT_KEY,
        'X-TikTok-Access-Token': apiKey
      },
      params: {
        app_id: 'your-app-id',
        timestamp: Math.floor(Date.now() / 1000),
        version: 'v1.0'
      }
    });

    return {
      code: response.data.code,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error posting product to TikTok:', error);
    throw error;
  }
};

export const fetchMessages = async (apiKey: string): Promise<TikTokResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/message/inbox`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-TikTok-Client-Key': CLIENT_KEY,
        'X-TikTok-Access-Token': apiKey
      },
      params: {
        app_id: 'your-app-id',
        timestamp: Math.floor(Date.now() / 1000),
        version: 'v1.0',
        page_size: 20
      }
    });

    return {
      code: response.data.code,
      message: response.data.message,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error fetching messages from TikTok:', error);
    throw error;
  }
};

export const recordSale = async (productId: string, apiKey: string, amount: number): Promise<TikTokResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/order/create`, {
      product_id: productId,
      amount: amount,
      timestamp: Math.floor(Date.now() / 1000)
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-TikTok-Client-Key': CLIENT_KEY,
        'X-TikTok-Access-Token': apiKey
      },
      params: {
        app_id: 'your-app-id',
        version: 'v1.0'
      }
    });

    return {
      code: response.data.code,
      message: response.data.message,
      data: response.data.data
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
