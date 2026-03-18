import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Integration from '../components/Integration';

describe('Integration', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<Integration />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('loads integrated content on mount', async () => {
    const { getByText } = render(<Integration />);
    await waitFor(() => getByText('Example Integrated Content'));
  });
});
