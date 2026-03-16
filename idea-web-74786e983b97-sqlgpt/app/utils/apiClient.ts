const API_BASE_URL = 'https://api.openai.com/v1';

const apiClient = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  post: async (endpoint: string, data: any) => {
    return apiClient.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default apiClient;
