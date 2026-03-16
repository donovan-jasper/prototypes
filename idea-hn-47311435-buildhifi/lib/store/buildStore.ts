import { create } from 'zustand';
import { Build, Component } from '../types';

interface BuildStore {
  currentBuild: Build | null;
  setCurrentBuild: (build: Build | null) => void;
  addComponent: (component: Component) => void;
  removeComponent: (componentId: number) => void;
}

const useBuildStore = create<BuildStore>((set) => ({
  currentBuild: null,
  setCurrentBuild: (build) => set({ currentBuild: build }),
  addComponent: (component) => set((state) => {
    if (!state.currentBuild) return state;
    return {
      currentBuild: {
        ...state.currentBuild,
        components: [...state.currentBuild.components, component],
      },
    };
  }),
  removeComponent: (componentId) => set((state) => {
    if (!state.currentBuild) return state;
    return {
      currentBuild: {
        ...state.currentBuild,
        components: state.currentBuild.components.filter(
          (component) => component.id !== componentId
        ),
      },
    };
  }),
}));

export default useBuildStore;
