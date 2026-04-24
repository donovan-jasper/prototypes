import { create } from 'zustand';
import type { Project, Screen, Component } from '@/types/project';
import {
  getProject,
  getScreensByProject,
  getComponentsByScreen,
  updateProject,
  createScreen,
  createComponent
} from '@/lib/db/queries';

interface EditorStore {
  currentProject: Project | null;
  currentScreen: Screen | null;
  components: Component[];
  selectedComponent: Component | null;
  loading: boolean;
  error: string | null;
  loadProjectData: (projectId: string) => Promise<void>;
  setCurrentScreen: (screenId: string) => void;
  selectComponent: (componentId: string | null) => void;
  updateComponent: (componentId: string, updates: Partial<Component>) => Promise<void>;
  addComponent: (component: Omit<Component, 'id'>) => Promise<Component>;
  removeComponent: (componentId: string) => Promise<void>;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  currentProject: null,
  currentScreen: null,
  components: [],
  selectedComponent: null,
  loading: false,
  error: null,

  loadProjectData: async (projectId) => {
    set({ loading: true, error: null });
    try {
      // Load project
      const project = await getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      // Load screens
      const screens = await getScreensByProject(projectId);
      if (screens.length === 0) {
        // Create a default screen if none exist
        const defaultScreen = await createScreen({
          projectId,
          name: 'Main Screen',
          order: 0,
          layout: {}
        });
        screens.push(defaultScreen);
      }

      // Set current screen to first one
      const currentScreen = screens[0];

      // Load components for current screen
      const components = await getComponentsByScreen(currentScreen.id);

      set({
        currentProject: project,
        currentScreen,
        components,
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  setCurrentScreen: async (screenId) => {
    if (!get().currentProject) return;

    set({ loading: true, error: null });
    try {
      // Find the screen in the project's screens
      const screens = await getScreensByProject(get().currentProject.id);
      const screen = screens.find(s => s.id === screenId);

      if (!screen) {
        throw new Error('Screen not found');
      }

      // Load components for the new screen
      const components = await getComponentsByScreen(screen.id);

      set({
        currentScreen: screen,
        components,
        selectedComponent: null,
        loading: false
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  selectComponent: (componentId) => {
    if (!componentId) {
      set({ selectedComponent: null });
      return;
    }

    const component = get().components.find(c => c.id === componentId);
    if (component) {
      set({ selectedComponent: component });
    }
  },

  updateComponent: async (componentId, updates) => {
    set({ loading: true, error: null });
    try {
      // Update component in state
      set(state => ({
        components: state.components.map(comp =>
          comp.id === componentId ? { ...comp, ...updates } : comp
        ),
        selectedComponent: state.selectedComponent?.id === componentId
          ? { ...state.selectedComponent, ...updates }
          : state.selectedComponent,
        loading: false
      }));

      // In a real app, you would also update the database here
      // await updateComponentInDb(componentId, updates);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  addComponent: async (componentData) => {
    if (!get().currentScreen) return Promise.reject('No screen selected');

    set({ loading: true, error: null });
    try {
      // Create component in database
      const newComponent = await createComponent({
        ...componentData,
        screenId: get().currentScreen.id
      });

      // Add to state
      set(state => ({
        components: [...state.components, newComponent],
        loading: false
      }));

      return newComponent;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  removeComponent: async (componentId) => {
    set({ loading: true, error: null });
    try {
      // Remove from state
      set(state => ({
        components: state.components.filter(comp => comp.id !== componentId),
        selectedComponent: state.selectedComponent?.id === componentId
          ? null
          : state.selectedComponent,
        loading: false
      }));

      // In a real app, you would also delete from database
      // await deleteComponentFromDb(componentId);
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
