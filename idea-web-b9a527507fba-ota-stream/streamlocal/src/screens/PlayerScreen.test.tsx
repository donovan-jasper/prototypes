import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PlayerScreen from './PlayerScreen';
import { AppContext } from '../context/AppContext';
import * as Cast from 'expo-cast';

jest.mock('expo-cast', () => ({
  addCastStateListener: jest.fn(),
  startCast: jest.fn(),
  stopCast: jest.fn(),
  CastState: {
    Connected: 'connected',
    Disconnected: 'disconnected',
  },
}));

describe('PlayerScreen', () => {
  const mockChannels = [
    {
      id: '1',
      name: 'ABC News',
      streamUrl: 'https://example.com/abc-stream.m3u8',
      logoUrl: 'https://example.com/abc-logo.png',
      currentProgram: 'Breaking News Update',
      nextProgram: 'Weather Forecast',
    },
    {
      id: '2',
      name: 'NBC News',
      streamUrl: 'https://example.com/nbc-stream.m3u8',
      logoUrl: 'https://example.com/nbc-logo.png',
      currentProgram: 'Sports Highlights',
      nextProgram: 'Local News',
    },
  ];

  const mockContextValue = {
    channels: mockChannels,
    favorites: [],
    addFavorite: jest.fn(),
    removeFavorite: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    const route = { params: { channelId: '1' } };
    const { getByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} navigation={{}} />
      </AppContext.Provider>
    );

    expect(getByText('Loading channel...')).toBeTruthy();
  });

  it('displays channel information when loaded', async () => {
    const route = { params: { channelId: '1' } };
    const { getByText, queryByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} navigation={{}} />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(queryByText('Loading channel...')).toBeNull();
    });

    expect(getByText('ABC News')).toBeTruthy();
    expect(getByText('Breaking News Update')).toBeTruthy();
    expect(getByText('Next: Weather Forecast')).toBeTruthy();
  });

  it('displays error message when channel is not found', async () => {
    const route = { params: { channelId: '99' } };
    const { getByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} navigation={{}} />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('Channel not found')).toBeTruthy();
    });
  });

  it('toggles favorite status when star button is pressed', async () => {
    const route = { params: { channelId: '1' } };
    const { getByTestId, getByText } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} navigation={{}} />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByText('ABC News')).toBeTruthy();
    });

    const starButton = getByTestId('star-button');
    fireEvent.press(starButton);

    await waitFor(() => {
      expect(mockContextValue.addFavorite).toHaveBeenCalledWith(mockChannels[0]);
    });

    fireEvent.press(starButton);

    await waitFor(() => {
      expect(mockContextValue.removeFavorite).toHaveBeenCalledWith('1');
    });
  });

  it('handles Chromecast toggle', async () => {
    const route = { params: { channelId: '1' } };
    const { getByTestId } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} navigation={{}} />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('cast-button')).toBeTruthy();
    });

    const castButton = getByTestId('cast-button');
    fireEvent.press(castButton);

    await waitFor(() => {
      expect(Cast.startCast).toHaveBeenCalled();
    });

    // Simulate cast state change
    const mockListener = Cast.addCastStateListener.mock.calls[0][0];
    mockListener(Cast.CastState.Connected);

    await waitFor(() => {
      expect(getByTestId('cast-button')).toHaveProp('icon', 'cast-connected');
    });

    fireEvent.press(castButton);

    await waitFor(() => {
      expect(Cast.stopCast).toHaveBeenCalled();
    });
  });

  it('handles share functionality', async () => {
    const route = { params: { channelId: '1' } };
    const { getByTestId } = render(
      <AppContext.Provider value={mockContextValue}>
        <PlayerScreen route={route} navigation={{}} />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(getByTestId('share-button')).toBeTruthy();
    });

    const shareButton = getByTestId('share-button');
    fireEvent.press(shareButton);

    // In a real test, you would mock the Share API and verify it was called
    // For this example, we'll just verify the button exists
  });
});
