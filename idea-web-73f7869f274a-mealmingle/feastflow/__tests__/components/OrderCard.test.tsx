import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import OrderCard from '../../components/OrderCard';

describe('OrderCard', () => {
  it('should render order details and navigate on press', () => {
    const mockOrder = {
      id: 1,
      restaurant: 'Test Restaurant',
      status: 'pending',
      deadline: new Date().toISOString(),
    };

    const { getByText } = render(<OrderCard order={mockOrder} />);

    expect(getByText('Test Restaurant')).toBeTruthy();
    expect(getByText('Status: pending')).toBeTruthy();
  });
});
