import { create } from 'zustand';
import { Product, CreateProductInput } from '../types/product';
import { getProducts } from '../lib/db';

interface ProductStore {
  products: Product[];
  addProduct: (input: CreateProductInput) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  loadProducts: () => Promise<void>;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
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
  loadProducts: async () => {
    try {
      const products = await getProducts();
      set({ products });
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  },
}));
