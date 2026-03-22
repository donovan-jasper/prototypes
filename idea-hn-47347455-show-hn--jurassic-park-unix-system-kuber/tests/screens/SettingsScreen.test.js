import React from 'react';
import { render } from '@testing-library/react-native';
import SettingsScreen from '../../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  it('renders settings screen', () => {
    const { getByText } = render(<SettingsScreen />);
    expect(getByText('Settings')).toBeTruthy();
  });
});
