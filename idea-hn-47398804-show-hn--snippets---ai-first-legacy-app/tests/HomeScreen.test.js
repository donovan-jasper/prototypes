import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../app/screens/HomeScreen';
import { useNavigation } from '@react-navigation/native';
import { initializeDatabase, addNote, getNotes } from '../app/services/database';

// Mock the navigation and database service
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../app/services/database', () => ({
  initializeDatabase: jest.fn(),
  addNote: jest.fn(),
  getNotes: jest.fn(),
}));

describe('HomeScreen', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useNavigation.mockReturnValue({
      navigate: mockNavigate,
    });
    initializeDatabase.mockResolvedValue();
    getNotes.mockResolvedValue([]);
    mockNavigate.mockClear();
  });

  it('renders correctly', async () => {
    const { getByText } = render(<HomeScreen />);

    await waitFor(() => {
      expect(getByText('EchoVault')).toBeTruthy();
      expect(getByText('Crisis Mode')).toBeTruthy();
    });
  });

  it('navigates to CrisisMode when crisis button is pressed', async () => {
    const { getByText } = render(<HomeScreen />);

    const crisisButton = getByText('Crisis Mode');
    fireEvent.press(crisisButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('CrisisMode');
    });
  });
});
