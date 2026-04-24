import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://graph.instagram.com';
const APP_ID = 'your-instagram-app-id';
const APP_SECRET = 'your-instagram-app-secret';

interface InstagramProduct {
  id: string;
  name: string;
  description: string;
  price: string;
  image_url: string;
  availability: string;
  condition: string;
  brand: string;
}

interface InstagramResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const formatProductForInstagram = (product: any): InstagramProduct => {
  return {
    id: product.id || `syncsell-${Date.now()}`,
    name: product.title,
    description: product.description || '',
    price: parseFloat(product.price).toFixed(2),
    image_url: product.imageUri,
    availability: parseInt(product.inventory) > 0 ? 'in stock' : 'out of stock',
    condition: 'new',
    brand: 'SyncSell'
  };
};

export const postProduct = async (product: any, apiKey: string, businessAccountId: string): Promise<InstagramResponse> => {
  try {
    const formattedProduct = formatProductForInstagram(product);

    // Mock API call for development
    console.log('Mock Instagram API call:', formattedProduct);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulate successful response
    return {
      success: true,
      data: {
        id: formattedProduct.id,
        status: 'published'
      }
    };
  } catch (error) {
    console.error('Error posting product to Instagram:', error);
    return {
      success: false,
      error: handleInstagramError(error)
    };
  }
};

export const fetchMessages = async (apiKey: string, businessAccountId: string): Promise<InstagramResponse> => {
  try {
    // Mock API call for development
    console.log('Mock Instagram fetch messages call');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 900));

    // Simulate successful response
    return {
      success: true,
      data: {
        messages: [
          {
            id: 'msg1',
            from: 'buyer1',
            message: 'Is this still available?',
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
    console.error('Error fetching messages from Instagram:', error);
    return {
      success: false,
      error: handleInstagramError(error)
    };
  }
};

export const recordSale = async (productId: string, apiKey: string, amount: number): Promise<InstagramResponse> => {
  try {
    // Mock API call for development
    console.log(`Mock Instagram record sale call for product ${productId}: $${amount}`);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Simulate successful response
    return {
      success: true,
      data: {
        order_id: `order-${Date.now()}`,
        status: 'completed'
      }
    };
  } catch (error) {
    console.error('Error recording sale on Instagram:', error);
    return {
      success: false,
      error: handleInstagramError(error)
    };
  }
};

export const handleInstagramError = (error: any): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid product data. Please check your product details.';
      case 401:
        return 'Authentication failed. Please reconnect your Instagram account.';
      case 403:
        return 'You don\'t have permission to post products.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Instagram server error. Please try again later.';
      default:
        return 'Failed to post product to Instagram. Please try again.';
    }
  }
  return 'Network error. Please check your internet connection.';
};

export const retryPostProduct = async (product: any, apiKey: string, businessAccountId: string, maxRetries = 3, delay = 1000): Promise<InstagramResponse> => {
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await postProduct(product, apiKey, businessAccountId);
      if (result.success) {
        return result;
      }
      throw new Error(result.error || 'Unknown error');
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};
