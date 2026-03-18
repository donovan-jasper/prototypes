import { fetch } from 'expo-fetch';

const api = {
  getSubscriptions: () => {
    return fetch('https://example.com/subscriptions');
  },
  unsubscribe: (id) => {
    return fetch(`https://example.com/subscriptions/${id}`, { method: 'DELETE' });
  },
};

export default api;
