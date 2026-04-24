import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/screens/HomeScreen';
import * as database from '../app/services/database';

// Mock the database module
jest.mock('../app/services/database', () => ({
  initializeDatabase: jest.fn(),
  addNote: jest.fn(() => Promise.resolve(1)),
  getNotes: jest.fn(() => Promise.resolve([{ id: 1, title: 'Test Note', content: 'Test Content', date: '2023-01-01', audioUri: null }])),
}));

// Mock the Audio module
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(),
    setAudioModeAsync: jest.fn(),
    Recording: {
      createAsync: jest.fn(() => ({
        recording: {
          stopAndUnloadAsync: jest.fn(),
          getURI: jest.fn(() => 'file://test.mp3')
        }
      }))
    }
  }
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders correctly and loads notes', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(database.initializeDatabase).toHaveBeenCalled();
      expect(database.getNotes).toHaveBeenCalled();
    });

    expect(getByText('Test Note')).toBeTruthy();
  });

  test('handles record button press', async () => {
    const { getByTestId } = render(<HomeScreen />);

    // Simulate record button press
    const recordButton = getByTestId('record-button');
    fireEvent.press(recordButton);

    // Verify recording started
    expect(require('expo-av').Audio.requestPermissionsAsync).toHaveBeenCalled();
    expect(require('expo-av').Audio.Recording.createAsync).toHaveBeenCalled();

    // Simulate stopping recording
    fireEvent.press(recordButton);

    await waitFor(() => {
      expect(database.addNote).toHaveBeenCalled();
    });
  });
});
