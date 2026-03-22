import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders monitoring screen and theme selector', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('System Metrics:')).toBeTruthy();
    expect(getByText('Theme:')).toBeTruthy();
  });
});
