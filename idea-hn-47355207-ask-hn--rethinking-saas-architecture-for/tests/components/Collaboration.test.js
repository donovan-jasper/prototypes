import React from 'react';
import { render } from '@testing-library/react-native';
import Collaboration from '../../src/components/Collaboration';

describe('Collaboration', () => {
  it('renders correctly', () => {
    const { getByText } = render(<Collaboration />);
    expect(getByText('Collaboration')).toBeTruthy();
  });
});
