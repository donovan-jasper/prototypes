import { create } from 'zustand';
import { Build, Component } from '../types';

interface BuildStore {
  currentBuild: Build | null;
  setCurrentBuild: (build: Build | null) => void;
  addComponent: (component: Component) => void;
  removeComponent: (componentId: number) => void;
  updateComponentPosition: (componentId: number, x: number, y: number) => void;
  clearCurrentBuild: () => void;
}

const useBuildStore = create<BuildStore>((set) => ({
  currentBuild: null,
  setCurrentBuild: (build) => set({ currentBuild: build }),
  addComponent: (component) => set((state) => {
    if (!state.currentBuild) return state;

    // Determine position based on component type
    let position = { x: 0, y: 0 };
    if (component.type === 'turntable' || component.type === 'streamer') {
      position = { x: 100, y: 100 };
    } else if (component.type === 'preamp') {
      position = { x: 300, y: 100 };
    } else if (component.type === 'amplifier') {
      position = { x: 500, y: 100 };
    } else if (component.type === 'speaker') {
      position = { x: 700, y: 100 };
    }

    return {
      currentBuild: {
        ...state.currentBuild,
        components: [...state.currentBuild.components, { ...component, position }],
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
  updateComponentPosition: (componentId, x, y) => set((state) => {
    if (!state.currentBuild) return state;
    return {
      currentBuild: {
        ...state.currentBuild,
        components: state.currentBuild.components.map(component =>
          component.id === componentId
            ? { ...component, position: { x, y } }
            : component
        ),
      },
    };
  }),
  clearCurrentBuild: () => set({ currentBuild: null }),
}));

export default useBuildStore;
