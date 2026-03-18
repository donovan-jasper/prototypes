import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ContentHub from '../components/ContentHub';

describe('ContentHub', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<ContentHub />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('loads content on mount', async () => {
    const { getByText } = render(<ContentHub />);
    await waitFor(() => getByText('Example Content'));
  });
});
