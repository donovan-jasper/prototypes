import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Home from '../../app/screens/Home';

test('runs a query flow', async () => {
  const { getByText, findByText } = render(<Home />);
  
  fireEvent.press(getByText('Start Listening'));
  
  await waitFor(() => {
    expect(getByText(/SELECT \* FROM sales WHERE date BETWEEN/)).toBeTruthy();
  }, { timeout: 3000 });
});
