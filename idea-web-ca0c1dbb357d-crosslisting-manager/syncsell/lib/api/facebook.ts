import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://graph.facebook.com';
const APP_ID = 'your-facebook-app-id';
const APP_SECRET = 'your-facebook-app-secret';

interface FacebookProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url: string;
  availability: string;
  condition: string;
  brand: string;
}

interface FacebookResponse {
  success: boolean;
  error?: string;
  data?: any;
}

export const formatProductForFacebook = (product: any): FacebookProduct => {
  return {
    id: product.id || `syncsell-${Date.now()}`,
    title: product.title,
    description: product.description || '',
    price: parseFloat(product.price),
    image_url: product.imageUri,
    availability: parseInt(product.inventory) > 0 ? 'in stock' : 'out of stock',
    condition: 'new',
    brand: 'SyncSell'
  };
};

export const postProduct = async (product: any, apiKey: string, pageId: string): Promise<FacebookResponse> => {
  try {
    const formattedProduct = formatProductForFacebook(product);

    const response = await axios.post(`${API_BASE_URL}/v12.0/${pageId}/products`, formattedProduct, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error posting product to Facebook:', error);
    return {
      success: false,
      error: handleFacebookError(error)
    };
  }
};

export const fetchMessages = async (apiKey: string, pageId: string): Promise<FacebookResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/v12.0/${pageId}/conversations`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      params: {
        fields: 'id,snippet,senders,updated_time',
        limit: 20
      }
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error fetching messages from Facebook:', error);
    return {
      success: false,
      error: handleFacebookError(error)
    };
  }
};

export const recordSale = async (productId: string, apiKey: string, amount: number): Promise<FacebookResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/v12.0/${productId}/orders`, {
    amount: amount.toFixed(2),
    currency: 'USD',
    timestamp: Math.floor(Date.now() / 1000)
  }, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    }
  });

  return {
    success: true,
    data: response.data
  };
} catch (error) {
  console.error('Error recording sale on Facebook:', error);
  return {
    success: false,
    error: handleFacebookError(error)
  };
}
};

export const handleFacebookError = (error: any): string => {
  if (error.response) {
    switch (error.response.status) {
      case 400:
        return 'Invalid product data. Please check your product details.';
      case 401:
        return 'Authentication failed. Please reconnect your Facebook account.';
      case 403:
        return 'You don\'t have permission to post products.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Facebook server error. Please try again later.';
      default:
        return 'Failed to post product to Facebook. Please try again.';
    }
  }
  return 'Network error. Please check your internet connection.';
};

export const retryPostProduct = async (product: any, apiKey: string, pageId: string, maxRetries = 3, delay = 1000): Promise<FacebookResponse> => {
  let lastError = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await postProduct(product, apiKey, pageId);
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
