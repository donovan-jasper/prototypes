import axios from 'axios';

export const ContentService = {
  async fetchFromSource(apiEndpoint) {
    try {
      const response = await axios.get(apiEndpoint);
      return response.data;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  },

  async getContentSources() {
    // In a real app, this would fetch from your backend
    return [
      {
        id: 'nytimes',
        name: 'The New York Times',
        description: 'Premium news and analysis from the world\'s leading newspaper',
        logo: 'https://static01.nyt.com/images/icons/t_logo_291_black.png',
        apiEndpoint: 'https://api.nytimes.com/svc/topstories/v2/home.json?api-key=YOUR_API_KEY'
      },
      {
        id: 'wsj',
        name: 'The Wall Street Journal',
        description: 'Business news and financial analysis',
        logo: 'https://www.wsj.com/apple-touch-icon.png',
        apiEndpoint: 'https://newsapi.org/v2/top-headlines?sources=the-wall-street-journal&apiKey=YOUR_API_KEY'
      },
      {
        id: 'medium',
        name: 'Medium',
        description: 'Stories and ideas from writers on any topic',
        logo: 'https://miro.medium.com/max/1400/1*jJbQJXz5QJQJQJQJQJQJQJ.png',
        apiEndpoint: 'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F'
      },
      {
        id: 'wired',
        name: 'Wired',
        description: 'The future of business, innovation, and culture',
        logo: 'https://www.wired.com/wp-content/themes/wired/assets/images/wired-logo.png',
        apiEndpoint: 'https://www.wired.com/feed/rss'
      },
      {
        id: 'theatlantic',
        name: 'The Atlantic',
        description: 'Politics, culture, and ideas from America\'s leading magazine',
        logo: 'https://cdn.theatlantic.com/assets/media/img/logo-default.png',
        apiEndpoint: 'https://www.theatlantic.com/feed/all/'
      },
      {
        id: 'npr',
        name: 'NPR',
        description: 'News, analysis, and commentary from NPR',
        logo: 'https://media.npr.org/images/nprlogo_600x336.png',
        apiEndpoint: 'https://feeds.npr.org/1001/rss.xml'
      }
    ];
  }
};
