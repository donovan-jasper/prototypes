import React from 'react';
import { render, act } from '@testing-library/react-native';
import { AppProvider, AppContext } from './AppContext';
import { fetchChannels } from '../services/channelService';
import { initDatabase, getChannels, insertChannels, getFavorites, addFavorite as dbAddFavorite, removeFavorite as dbRemoveFavorite, getAlerts, addAlert as dbAddAlert, removeAlert as dbRemoveAlert } from '../services/database';

jest.mock('../services/channelService');
jest.mock('../services/database');

describe('AppContext', () => {
  it('provides channels, favorites, and alerts', async () => {
    (fetchChannels as jest.Mock).mockResolvedValue([
      { id: '1', name: 'ABC News', logo: 'https://example.com/abc-logo.png', currentProgram: 'Breaking News', nextProgram: 'Weather Update' },
    ]);
    (getFavorites as jest.Mock).mockImplementation(callback => callback([{ channelId: '1' }]));
    (getAlerts as jest.Mock).mockImplementation(callback => callback([{ program: 'Breaking News', time: '18:00', weather: true, breakingNews: true }]));

    let contextValue;
    const TestComponent = () => {
      contextValue = React.useContext(AppContext);
      return null;
    };

    await act(async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );
    });

    expect(contextValue.channels).toEqual([
      { id: '1', name: 'ABC News', logo: 'https://example.com/abc-logo.png', currentProgram: 'Breaking News', nextProgram: 'Weather Update' },
    ]);
    expect(contextValue.favorites).toEqual([{ channelId: '1' }]);
    expect(contextValue.alerts).toEqual([{ program: 'Breaking News', time: '18:00', weather: true, breakingNews: true }]);
  });

  it('adds and removes favorites', async () => {
    (fetchChannels as jest.Mock).mockResolvedValue([]);
    (getFavorites as jest.Mock).mockImplementation(callback => callback([]));

    let contextValue;
    const TestComponent = () => {
      contextValue = React.useContext(AppContext);
      return null;
    };

    await act(async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );
    });

    act(() => {
      contextValue.addFavorite('1');
    });

    expect(dbAddFavorite).toHaveBeenCalledWith('1');
    expect(contextValue.favorites).toEqual([{ channelId: '1' }]);

    act(() => {
      contextValue.removeFavorite('1');
    });

    expect(dbRemoveFavorite).toHaveBeenCalledWith('1');
    expect(contextValue.favorites).toEqual([]);
  });

  it('adds and removes alerts', async () => {
    (fetchChannels as jest.Mock).mockResolvedValue([]);
    (getAlerts as jest.Mock).mockImplementation(callback => callback([]));

    let contextValue;
    const TestComponent = () => {
      contextValue = React.useContext(AppContext);
      return null;
    };

    await act(async () => {
      render(
        <AppProvider>
          <TestComponent />
        </AppProvider>
      );
    });

    const alert = { program: 'Breaking News', time: '18:00', weather: true, breakingNews: true };
    act(() => {
      contextValue.addAlert(alert);
    });

    expect(dbAddAlert).toHaveBeenCalledWith(alert);
    expect(contextValue.alerts).toEqual([alert]);

    act(() => {
      contextValue.removeAlert(0);
    });

    expect(dbRemoveAlert).toHaveBeenCalledWith(0);
    expect(contextValue.alerts).toEqual([]);
  });
});
