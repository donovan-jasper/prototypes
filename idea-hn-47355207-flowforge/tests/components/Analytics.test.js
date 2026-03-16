import React from 'react';
import { render } from '@testing-library/react-native';
import Analytics from '../../src/components/Analytics';

describe('Analytics', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Analytics />);
    expect(getByText('Analytics')).toBeTruthy();
  });
});
