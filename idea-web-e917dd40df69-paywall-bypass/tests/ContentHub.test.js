import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContentHub from '../components/ContentHub';
import { ContentService } from '../services/ContentService';

// Mock the ContentService
jest.mock('../services/ContentService');

// Mock the navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

describe('ContentHub', () => {
  beforeEach(() => {
    ContentService.getContentSources.mockResolvedValue([
      {
        id: 'nytimes',
        name: 'The New York Times',
        description: 'Premium news and analysis',
        logo: 'https://example.com/nytimes.png',
        apiEndpoint: 'https://api.example.com/nytimes'
      },
      {
        id: 'wsj',
        name: 'The Wall Street Journal',
        description: 'Business news',
        logo: 'https://example.com/wsj.png',
        apiEndpoint: 'https://api.example.com/wsj'
      }
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { toJSON } = render(<ContentHub />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays loading state initially', () => {
    const { getByText } = render(<ContentHub />);
    expect(getByText('Loading premium content sources...')).toBeTruthy();
  });

  it('displays content sources after loading', async () => {
    const { getByText } = render(<ContentHub />);

    await waitFor(() => {
      expect(getByText('The New York Times')).toBeTruthy();
      expect(getByText('The Wall Street Journal')).toBeTruthy();
    });
  });

  it('navigates to content source screen when a source is pressed', async () => {
    const { getByText } = render(<ContentHub />);

    await waitFor(() => {
      fireEvent.press(getByText('The New York Times'));
    });

    expect(mockNavigate).toHaveBeenCalledWith('ContentSource', {
      source: {
        id: 'nytimes',
        name: 'The New York Times',
        description: 'Premium news and analysis',
        logo: 'https://example.com/nytimes.png',
        apiEndpoint: 'https://api.example.com/nytimes'
      }
    });
  });

  it('displays error message when loading fails', async () => {
    ContentService.getContentSources.mockRejectedValue(new Error('Failed to load'));

    const { getByText } = render(<ContentHub />);

    await waitFor(() => {
      expect(getByText('Error loading content sources: Failed to load')).toBeTruthy();
    });
  });
});
