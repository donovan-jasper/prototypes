import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
});

const fetchContent = async () => {
  const response = await api.get('/content');
  return response.data;
};

const fetchRecommendations = async () => {
  const response = await api.get('/recommendations');
  return response.data;
};

const fetchIntegratedContent = async () => {
  const response = await api.get('/integrated-content');
  return response.data;
};

const fetchNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

export { fetchContent, fetchRecommendations, fetchIntegratedContent, fetchNotifications };
