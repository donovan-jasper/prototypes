import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import CrisisModeScreen from '../screens/CrisisModeScreen';
import { generateCrisisPin, setCrisisPin, verifyCrisisPin, isCrisisModeEnabled, getShareableLink, disableCrisisMode } from '../services/crisisMode';

// Mock the crisisMode service
jest.mock('../services/crisisMode', () => ({
  generateCrisisPin: jest.fn(() => '123456'),
  setCrisisPin: jest.fn(),
  verifyCrisisPin: jest.fn(),
  isCrisisModeEnabled: jest.fn(),
  getShareableLink: jest.fn(),
  disableCrisisMode: jest.fn(),
}));

describe('CrisisModeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = render(<CrisisModeScreen />);
    expect(getByText('Crisis Mode Setup')).toBeTruthy();
  });

  it('shows crisis mode controls when enabled', async () => {
    isCrisisModeEnabled.mockResolvedValue(true);
    getShareableLink.mockResolvedValue('https://example.com?pin=123456');

    const { getByText, getByPlaceholderText } = render(<CrisisModeScreen />);

    await waitFor(() => {
      expect(getByText('Your Crisis Access')).toBeTruthy();
      expect(getByText('123456')).toBeTruthy();
      expect(getByPlaceholderText('Enter 6-digit PIN')).toBeTruthy();
    });
  });

  it('generates a new PIN when crisis mode is enabled', async () => {
    isCrisisModeEnabled.mockResolvedValue(false);
    getShareableLink.mockResolvedValue('https://example.com?pin=123456');

    const { getByText, getByTestId } = render(<CrisisModeScreen />);

    // Enable crisis mode
    const switchButton = getByTestId('crisis-mode-switch');
    fireEvent(switchButton, 'valueChange', true);

    await waitFor(() => {
      expect(generateCrisisPin).toHaveBeenCalled();
      expect(setCrisisPin).toHaveBeenCalledWith('123456');
      expect(getByText('123456')).toBeTruthy();
    });
  });

  it('verifies PIN correctly', async () => {
    isCrisisModeEnabled.mockResolvedValue(true);
    getShareableLink.mockResolvedValue('https://example.com?pin=123456');
    verifyCrisisPin.mockResolvedValue(true);

    const { getByText } = render(<CrisisModeScreen />);

    await waitFor(() => {
      const verifyButton = getByText('Verify PIN');
      fireEvent.press(verifyButton);
    });

    await waitFor(() => {
      expect(verifyCrisisPin).toHaveBeenCalledWith('123456');
    });
  });

  it('allows PIN submission', async () => {
    const mockNavigate = jest.fn();
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({ navigate: mockNavigate }),
    }));

    isCrisisModeEnabled.mockResolvedValue(true);
    getShareableLink.mockResolvedValue('https://example.com?pin=123456');
    verifyCrisisPin.mockResolvedValue(true);

    const { getByPlaceholderText, getByText } = render(<CrisisModeScreen />);

    const input = getByPlaceholderText('Enter 6-digit PIN');
    fireEvent.changeText(input, '123456');

    const submitButton = getByText('Access Vault');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(verifyCrisisPin).toHaveBeenCalledWith('123456');
      expect(mockNavigate).toHaveBeenCalledWith('Vault', { crisisMode: true });
    });
  });
});
