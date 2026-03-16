import React from 'react';
import { render } from '@testing-library/react-native';
import ApplicationBuilder from '../../src/components/ApplicationBuilder';

describe('ApplicationBuilder', () => {
  it('renders correctly', () => {
    const { getByText } = render(<ApplicationBuilder />);
    expect(getByText('Application Builder')).toBeTruthy();
  });
});
