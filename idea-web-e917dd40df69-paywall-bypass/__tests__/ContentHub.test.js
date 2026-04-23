import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ContentHub from '../components/ContentHub';
import ContentService from '../services/ContentService';

// Mock the ContentService
jest.mock('../services/ContentService');

describe('ContentHub', () => {
  beforeEach(() => {
    ContentService.getContentSources.mockResolvedValue([
      { id: '1', name: 'Source 1', logo: 'logo1.png', description: 'Description 1' },
      { id: '2', name: 'Source 2', logo: 'logo2.png', description: 'Description 2' },
    ]);

    ContentService.getFeaturedContent.mockResolvedValue([
      { id: '1', title: 'Featured 1', image: 'image1.png', source: 'Source 1' },
      { id: '2', title: 'Featured 2', image: 'image2.png', source: 'Source 2' },
    ]);
  });

  it('renders loading state initially', () => {
    const { getByText } = render(<ContentHub />);
    expect(getByText('Loading premium content...')).toBeTruthy();
  });

  it('renders content sources after loading', async () => {
    const { findByText } = render(<ContentHub />);
    expect(await findByText('Source 1')).toBeTruthy();
    expect(await findByText('Source 2')).toBeTruthy();
  });

  it('renders featured content after loading', async () => {
    const { findByText } = render(<ContentHub />);
    expect(await findByText('Featured 1')).toBeTruthy();
    expect(await findByText('Featured 2')).toBeTruthy();
  });

  it('navigates to source when pressed', async () => {
    const mockNavigate = jest.fn();
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({
        navigate: mockNavigate,
      }),
    }));

    const { findByText } = render(<ContentHub />);
    const sourceElement = await findByText('Source 1');
    fireEvent.press(sourceElement);

    expect(mockNavigate).toHaveBeenCalledWith('ContentSource', expect.any(Object));
  });
});
