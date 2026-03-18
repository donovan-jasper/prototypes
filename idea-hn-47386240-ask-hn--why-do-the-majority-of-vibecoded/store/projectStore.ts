import { create } from 'zustand';
import type { Project } from '@/types/project';
import { getAllProjects, createProject, deleteProject } from '@/lib/db/queries';

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  loadProjects: () => Promise<void>;
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Project>;
  removeProject: (id: string) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  loadProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await getAllProjects();
      set({ projects, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  addProject: async (data) => {
    set({ loading: true, error: null });
    try {
      const project = await createProject(data);
      set((state) => ({
        projects: [project, ...state.projects],
        loading: false,
      }));
      return project;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  removeProject: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteProject(id);
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        loading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },
}));
