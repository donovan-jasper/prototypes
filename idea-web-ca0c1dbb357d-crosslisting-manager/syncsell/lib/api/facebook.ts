import axios from 'axios';

const API_BASE_URL = 'https://api.facebook.com/v1';

export const postProduct = async (product, apiKey) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/products`, product, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error posting product to Facebook:', error);
    throw error;
  }
};

export const fetchMessages = async (apiKey) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching messages from Facebook:', error);
    throw error;
  }
};

export const recordSale = async (productId, apiKey) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sales`, { productId }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error recording sale on Facebook:', error);
    throw error;
  }
};
