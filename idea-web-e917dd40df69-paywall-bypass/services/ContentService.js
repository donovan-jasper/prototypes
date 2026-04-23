import axios from 'axios';
import * as Clipboard from 'expo-clipboard';

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
  },

  async fetchArticle(url) {
    try {
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid URL provided');
      }

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        throw new Error('URL must start with http:// or https://');
      }

      // Simulate fetching article content
      const response = await axios.get(`https://api.librio.com/fetch-article?url=${encodeURIComponent(url)}`);

      if (!response.data || !response.data.content) {
        throw new Error('No article content found');
      }

      return {
        id: Date.now().toString(),
        url: url,
        title: response.data.title || 'Untitled Article',
        content: response.data.content,
        author: response.data.author || 'Unknown Author',
        date: response.data.date || new Date().toISOString(),
        source: response.data.source || 'Unknown Source',
        image: response.data.image || null
      };
    } catch (error) {
      console.error('Error fetching article:', error);
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error('Article not found. Please check the URL and try again.');
        } else if (error.response.status === 403) {
          throw new Error('Access to this article is restricted. Please try a different URL.');
        } else {
          throw new Error('Failed to fetch article. Please try again later.');
        }
      } else if (error.request) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.message || 'Invalid URL. Please enter a valid article URL.');
      }
    }
  },

  async getClipboardContent() {
    try {
      const text = await Clipboard.getStringAsync();
      return text;
    } catch (error) {
      console.error('Error reading clipboard:', error);
      throw new Error('Failed to read clipboard content');
    }
  },

  async getFeaturedContent() {
    try {
      // Simulate fetching featured content
      const response = await axios.get('https://api.librio.com/featured-content');
      return response.data.articles || [];
    } catch (error) {
      console.error('Error fetching featured content:', error);
      return [];
    }
  }
};

export default ContentService;
