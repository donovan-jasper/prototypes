import api from './api';

export const fetchNewsForSymbol = async (symbol: string) => {
  try {
    const response = await api.get(`/news/${symbol}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    throw error;
  }
};
