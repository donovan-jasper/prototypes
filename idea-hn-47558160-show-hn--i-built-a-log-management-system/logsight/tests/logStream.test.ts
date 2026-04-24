import React from 'react';
import { render } from '@testing-library/react-native';
import LogStream from '../app/components/LogStream';

test('renders log stream', () => {
  const { getByText } = render(<LogStream />);
  expect(getByText('Log Stream')).toBeTruthy();
});
