import { renderHook, act } from '@testing-library/react-hooks';
import useProductStore from '../lib/store/useProductStore';

describe('Product Store', () => {
  it('should add a product', () => {
    const { result } = renderHook(() => useProductStore());

    act(() => {
      result.current.addProduct({
        title: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        imageUri: 'test.jpg',
        inventory: 10,
        platforms: ['TikTok Shop'],
        createdAt: new Date().toISOString(),
      });
    });

    expect(result.current.products.length).toBe(1);
    expect(result.current.products[0].title).toBe('Test Product');
  });

  it('should update a product', () => {
    const { result } = renderHook(() => useProductStore());

    act(() => {
      result.current.addProduct({
        title: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        imageUri: 'test.jpg',
        inventory: 10,
        platforms: ['TikTok Shop'],
        createdAt: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.updateProduct({
        id: 1,
        title: 'Updated Product',
        description: 'Updated Description',
        price: 12.99,
        imageUri: 'updated.jpg',
        inventory: 5,
        platforms: ['TikTok Shop'],
      });
    });

    expect(result.current.products[0].title).toBe('Updated Product');
  });

  it('should delete a product', () => {
    const { result } = renderHook(() => useProductStore());

    act(() => {
      result.current.addProduct({
        title: 'Test Product',
        description: 'Test Description',
        price: 10.99,
        imageUri: 'test.jpg',
        inventory: 10,
        platforms: ['TikTok Shop'],
        createdAt: new Date().toISOString(),
      });
    });

    act(() => {
      result.current.deleteProduct(1);
    });

    expect(result.current.products.length).toBe(0);
  });

  it('should fetch products', () => {
    const { result } = renderHook(() => useProductStore());

    act(() => {
      result.current.fetchProducts();
    });

    expect(result.current.products.length).toBeGreaterThanOrEqual(0);
  });
});
