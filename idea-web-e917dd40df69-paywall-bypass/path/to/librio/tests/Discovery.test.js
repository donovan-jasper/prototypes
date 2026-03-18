import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Discovery from '../components/Discovery';

describe('Discovery', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<Discovery />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('loads recommendations on mount', async () => {
    const { getByText } = render(<Discovery />);
    await waitFor(() => getByText('Example Recommendation'));
  });
});
