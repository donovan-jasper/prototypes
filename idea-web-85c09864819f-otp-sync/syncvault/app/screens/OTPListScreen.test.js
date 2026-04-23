import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OTPListScreen from './OTPListScreen';

describe('OTPListScreen', () => {
  it('renders empty state when no accounts are added', () => {
    const { getByText } = render(<OTPListScreen route={{ params: { otpAccounts: [] } }} />);
    expect(getByText('No OTP accounts added yet')).toBeTruthy();
  });

  it('renders OTP accounts when provided', () => {
    const mockAccounts = [
      { id: '1', name: 'Account 1', secret: 'secret1' },
      { id: '2', name: 'Account 2', secret: 'secret2' },
    ];

    const { getByText } = render(
      <OTPListScreen route={{ params: { otpAccounts: mockAccounts } }} />
    );

    expect(getByText('Account 1')).toBeTruthy();
    expect(getByText('Account 2')).toBeTruthy();
  });

  it('navigates back when back button is pressed', () => {
    const mockNavigation = { goBack: jest.fn() };
    const { getByText } = render(
      <OTPListScreen route={{ params: { otpAccounts: [] } }} navigation={mockNavigation} />
    );

    fireEvent.press(getByText('←'));
    expect(mockNavigation.goBack).toHaveBeenCalled();
  });
});
