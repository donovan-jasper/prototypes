import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../screens/SettingsScreen';

describe('SettingsScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<SettingsScreen />);

    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Enable Notifications')).toBeTruthy();
    expect(getByText('Dark Mode')).toBeTruthy();
    expect(getByText('Premium Subscription')).toBeTruthy();
    expect(getByText('Save Settings')).toBeTruthy();
  });

  it('displays premium features when premium is enabled', () => {
    const { getByText, getByLabelText } = render(<SettingsScreen />);
    const premiumSwitch = getByText('Premium Subscription').parent?.parent?.findByType('Switch');

    if (premiumSwitch) {
      fireEvent(premiumSwitch, 'onValueChange', true);
      expect(getByText('Premium Features:')).toBeTruthy();
      expect(getByText('- Unlimited analyses')).toBeTruthy();
      expect(getByText('- Advanced detection')).toBeTruthy();
    }
  });
});
