import { ContentService } from '../services/ContentService';
import axios from 'axios';
import * as Clipboard from 'expo-clipboard';

jest.mock('axios');
jest.mock('expo-clipboard');

describe('ContentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchFromSource', () => {
    it('should fetch data from API endpoint', async () => {
      const mockData = { data: 'test data' };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await ContentService.fetchFromSource('https://api.example.com');
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith('https://api.example.com');
    });

    it('should throw error when fetch fails', async () => {
      const error = new Error('Network Error');
      axios.get.mockRejectedValue(error);

      await expect(ContentService.fetchFromSource('https://api.example.com'))
        .rejects.toThrow('Network Error');
    });
  });

  describe('getContentSources', () => {
    it('should return an array of content sources', async () => {
      const sources = await ContentService.getContentSources();
      expect(Array.isArray(sources)).toBe(true);
      expect(sources.length).toBeGreaterThan(0);
      expect(sources[0]).toHaveProperty('id');
      expect(sources[0]).toHaveProperty('name');
      expect(sources[0]).toHaveProperty('apiEndpoint');
    });
  });

  describe('fetchArticle', () => {
    it('should fetch article content', async () => {
      const mockArticle = {
        title: 'Test Article',
        content: 'This is test content',
        author: 'Test Author',
        date: '2023-01-01',
        source: 'Test Source'
      };

      axios.get.mockResolvedValue({ data: mockArticle });

      const result = await ContentService.fetchArticle('https://example.com/article');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('url', 'https://example.com/article');
      expect(result).toHaveProperty('title', 'Test Article');
      expect(result).toHaveProperty('content', 'This is test content');
    });

    it('should throw error for invalid URL', async () => {
      await expect(ContentService.fetchArticle(''))
        .rejects.toThrow('Invalid URL provided');
    });

    it('should throw error when article content is missing', async () => {
      axios.get.mockResolvedValue({ data: {} });

      await expect(ContentService.fetchArticle('https://example.com/article'))
        .rejects.toThrow('No article content found');
    });
  });

  describe('getClipboardContent', () => {
    it('should get clipboard content', async () => {
      const mockText = 'https://example.com/article';
      Clipboard.getStringAsync.mockResolvedValue(mockText);

      const result = await ContentService.getClipboardContent();
      expect(result).toBe(mockText);
    });

    it('should throw error when clipboard access fails', async () => {
      const error = new Error('Clipboard Error');
      Clipboard.getStringAsync.mockRejectedValue(error);

      await expect(ContentService.getClipboardContent())
        .rejects.toThrow('Failed to read clipboard content');
    });
  });
});
