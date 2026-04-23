import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AddArticle from '../screens/AddArticle';
import { ContentService } from '../services/ContentService';

jest.mock('../services/ContentService');

describe('AddArticle', () => {
  const mockNavigation = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(
      <AddArticle navigation={mockNavigation} />
    );

    expect(getByText('Add Article')).toBeTruthy();
    expect(getByPlaceholderText('https://example.com/article')).toBeTruthy();
    expect(getByText('Fetch Article')).toBeTruthy();
  });

  it('shows error when URL is empty', async () => {
    const { getByText } = render(<AddArticle navigation={mockNavigation} />);
    const fetchButton = getByText('Fetch Article');

    fireEvent.press(fetchButton);

    await waitFor(() => {
      expect(getByText('Please enter a URL')).toBeTruthy();
    });
  });

  it('shows error when URL is invalid', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AddArticle navigation={mockNavigation} />
    );

    const input = getByPlaceholderText('https://example.com/article');
    fireEvent.changeText(input, 'invalid-url');

    const fetchButton = getByText('Fetch Article');
    fireEvent.press(fetchButton);

    await waitFor(() => {
      expect(getByText('Please enter a valid URL starting with http:// or https://')).toBeTruthy();
    });
  });

  it('fetches article successfully', async () => {
    const mockArticle = {
      id: '1',
      url: 'https://example.com/article',
      title: 'Test Article',
      content: 'Test content',
    };

    ContentService.fetchArticle.mockResolvedValue(mockArticle);

    const { getByPlaceholderText, getByText } = render(
      <AddArticle navigation={mockNavigation} />
    );

    const input = getByPlaceholderText('https://example.com/article');
    fireEvent.changeText(input, 'https://example.com/article');

    const fetchButton = getByText('Fetch Article');
    fireEvent.press(fetchButton);

    await waitFor(() => {
      expect(ContentService.fetchArticle).toHaveBeenCalledWith('https://example.com/article');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('ArticleView', { article: mockArticle });
    });
  });

  it('handles fetch article error', async () => {
    const errorMessage = 'Failed to fetch article';
    ContentService.fetchArticle.mockRejectedValue(new Error(errorMessage));

    const { getByPlaceholderText, getByText, queryByText } = render(
      <AddArticle navigation={mockNavigation} />
    );

    const input = getByPlaceholderText('https://example.com/article');
    fireEvent.changeText(input, 'https://example.com/article');

    const fetchButton = getByText('Fetch Article');
    fireEvent.press(fetchButton);

    await waitFor(() => {
      expect(queryByText(errorMessage)).toBeTruthy();
    });
  });

  it('pastes from clipboard', async () => {
    const clipboardContent = 'https://example.com/article';
    ContentService.getClipboardContent.mockResolvedValue(clipboardContent);

    const { getByText, getByPlaceholderText } = render(
      <AddArticle navigation={mockNavigation} />
    );

    const pasteButton = getByText('Paste');
    fireEvent.press(pasteButton);

    await waitFor(() => {
      expect(ContentService.getClipboardContent).toHaveBeenCalled();
      expect(getByPlaceholderText('https://example.com/article').props.value).toBe(clipboardContent);
    });
  });

  it('shows error when clipboard has no valid URL', async () => {
    ContentService.getClipboardContent.mockResolvedValue('invalid content');

    const { getByText } = render(<AddArticle navigation={mockNavigation} />);
    const pasteButton = getByText('Paste');

    fireEvent.press(pasteButton);

    await waitFor(() => {
      expect(getByText('No valid URL found in clipboard')).toBeTruthy();
    });
  });
});
