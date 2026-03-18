import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import OfflineReading from '../components/OfflineReading';

describe('OfflineReading', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<OfflineReading />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('loads offline content on mount', async () => {
    const { getByText } = render(<OfflineReading />);
    await waitFor(() => getByText('Example Offline Content'));
  });
});
