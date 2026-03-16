import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProductCard from '../../components/ProductCard';

describe('ProductCard', () => {
  const product = {
    id: 1,
    title: 'Test Product',
    price: 10.99,
    inventory: 10,
    imageUri: 'test.jpg',
    platforms: ['TikTok Shop'],
  };

  it('should render product details', () => {
    const { getByText, getByTestId } = render(<ProductCard product={product} />);

    expect(getByText('Test Product')).toBeDefined();
    expect(getByText('$10.99')).toBeDefined();
    expect(getByText('Inventory: 10')).toBeDefined();
    expect(getByText('TikTok Shop')).toBeDefined();
  });

  it('should navigate to product detail on press', () => {
    const mockRouter = { push: jest.fn() };
    jest.mock('expo-router', () => ({
      useRouter: () => mockRouter,
    }));

    const { getByTestId } = render(<ProductCard product={product} />);
    fireEvent.press(getByTestId('product-card'));

    expect(mockRouter.push).toHaveBeenCalledWith('/product/1');
  });
});
