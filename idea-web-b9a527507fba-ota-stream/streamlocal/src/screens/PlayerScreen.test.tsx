import React from 'react';
import { render } from '@testing-library/react-native';
import PlayerScreen from './PlayerScreen';
import { AppContext } from '../context/AppContext';

describe('PlayerScreen', () => {
  const mockChannels = [
    { id: '1', name: 'ABC News', streamUrl: 'https://example.com/abc-stream.m3u8' },
    { id: '2', name: 'NBC News', streamUrl: 'https://example.com/nbc-stream.m3u8' },
  ];

  const mockContextValue = {
    channels: mockChannels,
    favorites: [],
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };

  it('renders VideoPlayer with the correct stream URL', () => {
    const route = { params: { channelId: '1' } };
    const { getByTestId } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} />
      </AppContext.Provider>
    );

    expect(getByTestId('video-player')).toHaveProp('source', { uri: 'https://example.com/abc-stream.m3u8' });
  });

  it('displays error message when channel is not found', () => {
    const route = { params: { channelId: '3' } };
    const { getByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} />
      </AppContext.Provider>
    );

    expect(getByText('Channel not found')).toBeTruthy();
  });
});
