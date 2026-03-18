import { create } from 'zustand';
import { Product, CreateProductInput } from '../types/product';

interface ProductStore {
  products: Product[];
  addProduct: (input: CreateProductInput) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [
    {
      id: '1',
      title: 'Vintage Leather Jacket',
      description: 'Classic brown leather jacket in excellent condition',
      price: 89.99,
      quantity: 1,
      platforms: ['eBay', 'Shopify'],
      createdAt: Date.now() - 86400000,
    },
    {
      id: '2',
      title: 'Handmade Ceramic Mug Set',
      description: 'Set of 4 artisan coffee mugs',
      price: 45.00,
      quantity: 3,
      platforms: ['Etsy', 'Amazon'],
      createdAt: Date.now() - 172800000,
    },
    {
      id: '3',
      title: 'Wireless Bluetooth Headphones',
      description: 'Noise-cancelling over-ear headphones',
      price: 129.99,
      quantity: 5,
      platforms: ['Amazon', 'eBay'],
      createdAt: Date.now() - 259200000,
    },
  ],
  addProduct: (input) =>
    set((state) => ({
      products: [
        {
          ...input,
          id: Date.now().toString(),
          createdAt: Date.now(),
        },
        ...state.products,
      ],
    })),
  removeProduct: (id) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
    })),
  updateProduct: (id, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
}));
