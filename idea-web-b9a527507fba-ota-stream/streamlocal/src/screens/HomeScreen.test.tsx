import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';
import { AppContext } from '../context/AppContext';

describe('HomeScreen', () => {
  const mockChannels = [
    { id: '1', name: 'ABC News', logo: 'https://example.com/abc-logo.png', currentProgram: 'Breaking News', nextProgram: 'Weather Update' },
    { id: '2', name: 'NBC News', logo: 'https://example.com/nbc-logo.png', currentProgram: 'Nightly News', nextProgram: 'Sports Highlights' },
  ];

  const mockFavorites = [{ id: '1' }];

  const mockContextValue = {
    channels: mockChannels,
    favorites: mockFavorites,
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };

  it('renders correctly', () => {
    const { getByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <HomeScreen />
      </AppContext.Provider>
    );

    expect(getByText('ABC News')).toBeTruthy();
    expect(getByText('NBC News')).toBeTruthy();
  });

  it('filters channels based on search query', () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <HomeScreen />
      </AppContext.Provider>
    );

    fireEvent.changeText(getByPlaceholderText('Search channels'), 'ABC');
    expect(getByText('ABC News')).toBeTruthy();
    expect(queryByText('NBC News')).toBeNull();
  });
});
