import create from 'zustand';
import { addProduct, updateProduct, deleteProduct, getProducts } from '../db';

const useProductStore = create((set) => ({
  products: [],
  loading: false,
  error: null,
  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      getProducts((products) => {
        set({ products, loading: false });
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  addProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      addProduct(product, (id) => {
        set((state) => ({
          products: [...state.products, { ...product, id }],
          loading: false,
        }));
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  updateProduct: async (product) => {
    set({ loading: true, error: null });
    try {
      updateProduct(product, () => {
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p)),
          loading: false,
        }));
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      deleteProduct(id, () => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
          loading: false,
        }));
      });
    } catch (error) {
      set({ error, loading: false });
    }
  },
}));

export default useProductStore;
