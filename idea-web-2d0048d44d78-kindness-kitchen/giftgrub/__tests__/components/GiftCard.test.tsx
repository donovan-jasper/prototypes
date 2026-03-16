import React from 'react';
import { render } from '@testing-library/react-native';
import GiftCard from '../../components/GiftCard';

describe('GiftCard Component', () => {
  it('should render gift details correctly', () => {
    const gift = {
      id: '1',
      recipientName: 'Alice',
      restaurant: 'Pizza Palace',
      message: 'Happy Birthday!',
      status: 'delivered',
      amount: 30,
    };

    const { getByText } = render(<GiftCard gift={gift} />);

    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Pizza Palace')).toBeTruthy();
    expect(getByText('Happy Birthday!')).toBeTruthy();
  });
});
