import create from 'zustand';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../db';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  inventory: number;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: number) => void;
  decrementInventory: (id: number, amount: number) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const products = await getProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addProduct: (product) => {
    set((state) => ({
      products: [product, ...state.products],
    }));
  },

  updateProduct: (updatedProduct) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      ),
    }));
  },

  deleteProduct: (id) => {
    set((state) => ({
      products: state.products.filter((product) => product.id !== id),
    }));
  },

  decrementInventory: (id, amount) => {
    set((state) => ({
      products: state.products.map((product) =>
        product.id === id
          ? { ...product, inventory: Math.max(0, product.inventory - amount) }
          : product
      ),
    }));
  },
}));
