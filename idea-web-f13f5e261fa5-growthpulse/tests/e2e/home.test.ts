import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../../app/(tabs)/home';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Welcome to ProgressPulse')).toBeTruthy();
    expect(getByText('Track your habits and boost productivity')).toBeTruthy();
  });
});
