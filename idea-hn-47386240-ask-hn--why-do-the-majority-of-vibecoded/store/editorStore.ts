import { create } from 'zustand';
import type { Project, Screen, Component } from '@/types/project';
import { getProject, getScreensByProject, getComponentsByScreen, createScreen as dbCreateScreen, createComponent as dbCreateComponent } from '@/lib/db/queries';
import { Alert } from 'react-native'; // For error feedback

interface EditorState {
  currentProject: Project | null;
  screens: Screen[];
  activeScreenId: string | null;
  components: Component[];
  loading: boolean;
  error: string | null;
}

interface EditorActions {
  loadProjectData: (projectId: string) => Promise<void>;
  setActiveScreen: (screenId: string) => Promise<void>;
  addScreen: (name: string) => Promise<Screen | null>;
  // For now, just a placeholder to add a component. Actual implementation will be more complex.
  addComponent: (screenId: string, type: string, props: object, position: object, order: number) => Promise<Component | null>;
  // TODO: Add update/delete for screens and components
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  currentProject: null,
  screens: [],
  activeScreenId: null,
  components: [],
  loading: false,
  error: null,

  loadProjectData: async (projectId: string) => {
    set({ loading: true, error: null, currentProject: null, screens: [], activeScreenId: null, components: [] });
    try {
      const project = await getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }
      const screens = await getScreensByProject(projectId);

      let activeScreenId = screens.length > 0 ? screens[0].id : null;
      let components: Component[] = [];

      // If no screens exist, create a default one
      if (screens.length === 0) {
        const newScreen = await dbCreateScreen({
          projectId: project.id,
          name: 'Home Screen',
          order: 0,
          layout: {},
        });
        screens.push(newScreen);
        activeScreenId = newScreen.id;
      }

      if (activeScreenId) {
        components = await getComponentsByScreen(activeScreenId);
      }

      set({
        currentProject: project,
        screens,
        activeScreenId,
        components,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load project data:', error);
      set({ error: (error as Error).message, loading: false });
      Alert.alert('Error', `Failed to load project: ${(error as Error).message}`);
    }
  },

  setActiveScreen: async (screenId: string) => {
    set({ loading: true, error: null, components: [] });
    try {
      const components = await getComponentsByScreen(screenId);
      set({ activeScreenId: screenId, components, loading: false });
    } catch (error) {
      console.error('Failed to set active screen:', error);
      set({ error: (error as Error).message, loading: false });
      Alert.alert('Error', `Failed to load screen components: ${(error as Error).message}`);
    }
  },

  addScreen: async (name: string) => {
    const { currentProject, screens } = get();
    if (!currentProject) {
      Alert.alert('Error', 'No project selected to add a screen to.');
      return null;
    }

    set({ loading: true, error: null });
    try {
      const newScreen = await dbCreateScreen({
        projectId: currentProject.id,
        name,
        order: screens.length, // Simple ordering for now
        layout: {},
      });
      set((state) => ({
        screens: [...state.screens, newScreen],
        loading: false,
      }));
      return newScreen;
    } catch (error) {
      console.error('Failed to add screen:', error);
      set({ error: (error as Error).message, loading: false });
      Alert.alert('Error', `Failed to add screen: ${(error as Error).message}`);
      return null;
    }
  },

  addComponent: async (screenId: string, type: string, props: object, position: object, order: number) => {
    set({ loading: true, error: null });
    try {
      const newComponent = await dbCreateComponent({
        screenId,
        type,
        props,
        position,
        order,
      });
      set((state) => ({
        components: [...state.components, newComponent],
        loading: false,
      }));
      return newComponent;
    } catch (error) {
      console.error('Failed to add component:', error);
      set({ error: (error as Error).message, loading: false });
      Alert.alert('Error', `Failed to add component: ${(error as Error).message}`);
      return null;
    }
  },
}));
