import { create } from 'zustand';
import type { Project, Screen, Component } from '@/types/project';
import {
  getProject,
  getScreensByProject,
  getComponentsByScreen,
  updateProject,
  createScreen,
  updateScreen,
  deleteScreen,
  createComponent,
  updateComponent,
  deleteComponent
} from '@/lib/db/queries';

interface EditorStore {
  currentProject: Project | null;
  currentScreen: Screen | null;
  components: Component[];
  selectedComponent: Component | null;
  loading: boolean;
  error: string | null;
  loadProjectData: (projectId: string) => Promise<void>;
  selectScreen: (screenId: string) => Promise<void>;
  selectComponent: (componentId: string | null) => void;
  updateComponentProps: (componentId: string, props: Record<string, any>) => Promise<void>;
  addComponent: (screenId: string, component: Omit<Component, 'id'>) => Promise<Component>;
  removeComponent: (componentId: string) => Promise<void>;
  updateProjectName: (name: string) => Promise<void>;
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
      const project = await getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const screens = await getScreensByProject(projectId);
      const firstScreen = screens.length > 0 ? screens[0] : null;

      if (firstScreen) {
        const components = await getComponentsByScreen(firstScreen.id);
        set({
          currentProject: project,
          currentScreen: firstScreen,
          components,
          loading: false,
        });
      } else {
        set({
          currentProject: project,
          currentScreen: null,
          components: [],
          loading: false,
        });
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  selectScreen: async (screenId) => {
    set({ loading: true, error: null });
    try {
      const { currentProject } = get();
      if (!currentProject) throw new Error('No project loaded');

      const screens = await getScreensByProject(currentProject.id);
      const selectedScreen = screens.find(s => s.id === screenId);

      if (!selectedScreen) throw new Error('Screen not found');

      const components = await getComponentsByScreen(screenId);
      set({
        currentScreen: selectedScreen,
        components,
        selectedComponent: null,
        loading: false,
      });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  selectComponent: (componentId) => {
    const { components } = get();
    const selected = componentId ? components.find(c => c.id === componentId) : null;
    set({ selectedComponent: selected });
  },

  updateComponentProps: async (componentId, props) => {
    set({ loading: true, error: null });
    try {
      const { components } = get();
      const componentIndex = components.findIndex(c => c.id === componentId);

      if (componentIndex === -1) throw new Error('Component not found');

      const updatedComponent = { ...components[componentIndex], props };
      await updateComponent(componentId, { props });

      set(state => ({
        components: [
          ...state.components.slice(0, componentIndex),
          updatedComponent,
          ...state.components.slice(componentIndex + 1)
        ],
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  addComponent: async (screenId, componentData) => {
    set({ loading: true, error: null });
    try {
      const newComponent = await createComponent({
        screenId,
        ...componentData,
      });

      set(state => ({
        components: [...state.components, newComponent],
        selectedComponent: newComponent,
        loading: false,
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
      await deleteComponent(componentId);

      set(state => ({
        components: state.components.filter(c => c.id !== componentId),
        selectedComponent: state.selectedComponent?.id === componentId ? null : state.selectedComponent,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  updateProjectName: async (name) => {
    set({ loading: true, error: null });
    try {
      const { currentProject } = get();
      if (!currentProject) throw new Error('No project loaded');

      await updateProject(currentProject.id, { name });

      set(state => ({
        currentProject: state.currentProject ? { ...state.currentProject, name } : null,
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
