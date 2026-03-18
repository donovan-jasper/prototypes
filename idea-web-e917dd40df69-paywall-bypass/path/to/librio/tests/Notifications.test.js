import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Notifications from '../components/Notifications';

describe('Notifications', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<Notifications />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('loads notifications on mount', async () => {
    const { getByText } = render(<Notifications />);
    await waitFor(() => getByText('Example Notification'));
  });
});
