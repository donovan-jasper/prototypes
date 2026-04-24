import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CrisisModeScreen from '../app/screens/CrisisModeScreen';
import { verifyCrisisPin } from '../app/services/crisisMode';
import { useNavigation } from '@react-navigation/native';

// Mock the navigation and crisisMode service
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../app/services/crisisMode', () => ({
  verifyCrisisPin: jest.fn(),
}));

describe('CrisisModeScreen', () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    useNavigation.mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
    });
    verifyCrisisPin.mockClear();
    mockNavigate.mockClear();
    mockGoBack.mockClear();
  });

  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<CrisisModeScreen />);

    expect(getByText('Crisis Mode Access')).toBeTruthy();
    expect(getByText('Enter your family\'s shared PIN to access the encrypted vault')).toBeTruthy();
    expect(getByPlaceholderText('Enter 6-digit PIN')).toBeTruthy();
    expect(getByText('Access Vault')).toBeTruthy();
    expect(getByText('Back to Home')).toBeTruthy();
  });

  it('shows error when PIN is not 6 digits', async () => {
    const { getByText, getByPlaceholderText } = render(<CrisisModeScreen />);
    const pinInput = getByPlaceholderText('Enter 6-digit PIN');
    const submitButton = getByText('Access Vault');

    fireEvent.changeText(pinInput, '12345');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(getByText('Error')).toBeTruthy();
      expect(getByText('PIN must be 6 digits')).toBeTruthy();
    });
  });

  it('navigates to Vault when PIN is correct', async () => {
    verifyCrisisPin.mockResolvedValue(true);

    const { getByText, getByPlaceholderText } = render(<CrisisModeScreen />);
    const pinInput = getByPlaceholderText('Enter 6-digit PIN');
    const submitButton = getByText('Access Vault');

    fireEvent.changeText(pinInput, '123456');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(verifyCrisisPin).toHaveBeenCalledWith('123456');
      expect(mockNavigate).toHaveBeenCalledWith('Vault', { crisisMode: true });
    });
  });

  it('shows error when PIN is incorrect', async () => {
    verifyCrisisPin.mockResolvedValue(false);

    const { getByText, getByPlaceholderText } = render(<CrisisModeScreen />);
    const pinInput = getByPlaceholderText('Enter 6-digit PIN');
    const submitButton = getByText('Access Vault');

    fireEvent.changeText(pinInput, '123456');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(verifyCrisisPin).toHaveBeenCalledWith('123456');
      expect(getByText('Error')).toBeTruthy();
      expect(getByText('Invalid PIN')).toBeTruthy();
    });
  });

  it('goes back when back button is pressed', () => {
    const { getByText } = render(<CrisisModeScreen />);
    const backButton = getByText('Back to Home');

    fireEvent.press(backButton);

    expect(mockGoBack).toHaveBeenCalled();
  });
});
