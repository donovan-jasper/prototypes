import React from 'react';
import { render } from '@testing-library/react-native';
import InventoryCard from '../../components/InventoryCard';

describe('InventoryCard', () => {
  it('renders item details', () => {
    const item = {
      id: '1',
      name: 'Legendary Sword',
      game: 'Fortnite',
      rarity: 'legendary',
      value: 1500,
    };
    const { getByText } = render(<InventoryCard item={item} />);
    expect(getByText('Legendary Sword')).toBeTruthy();
    expect(getByText('Fortnite')).toBeTruthy();
    expect(getByText('1500')).toBeTruthy();
  });
});
