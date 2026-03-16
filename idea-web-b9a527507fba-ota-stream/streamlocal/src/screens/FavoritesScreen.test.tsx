import React from 'react';
import { render } from '@testing-library/react-native';
import FavoritesScreen from './FavoritesScreen';
import { AppContext } from '../context/AppContext';

describe('FavoritesScreen', () => {
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

  it('renders favorite channels correctly', () => {
    const { getByText, queryByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <FavoritesScreen />
      </AppContext.Provider>
    );

    expect(getByText('ABC News')).toBeTruthy();
    expect(queryByText('NBC News')).toBeNull();
  });

  it('displays empty state when there are no favorites', () => {
    const emptyContextValue = {
      ...mockContextValue,
      favorites: [],
    };

    const { getByText } = render(
      <AppContext.Provider value={emptyContextValue}>
        <FavoritesScreen />
      </AppContext.Provider>
    );

    expect(getByText('No favorites yet. Add some from the Home screen!')).toBeTruthy();
  });
});
