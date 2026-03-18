import * as FileSystem from 'expo-file-system';
import { 
  createProject as createDbProject, 
  updateProject as updateDbProject, 
  deleteProject as deleteDbProject,
  getProjects as getDbProjects
} from './database';

export const saveProject = async (project) => {
  try {
    if (project.id) {
      await updateDbProject(project);
    } else {
      project.id = Date.now().toString();
      project.createdAt = Date.now();
      project.updatedAt = Date.now();
      await createDbProject(project);
    }
    return { success: true };
  } catch (error) {
    console.error('Error saving project:', error);
    return { success: false, error: error.message };
  }
};

export const loadProject = async (id: string) => {
  try {
    const projects = await getDbProjects();
    return projects.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error loading project:', error);
    return null;
  }
};

export const deleteProject = async (id: string) => {
  try {
    await deleteDbProject(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting project:', error);
    return { success: false, error: error.message };
  }
};

export const exportProjectFiles = async (project) => {
  try {
    const exportDir = `${FileSystem.documentDirectory}exports/${project.id}`;
    await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

    const codeFile = `${exportDir}/code.ts`;
    await FileSystem.writeAsStringAsync(codeFile, project.code);

    if (project.compiledJs) {
      const jsFile = `${exportDir}/app.js`;
      await FileSystem.writeAsStringAsync(jsFile, project.compiledJs);
    }

    return { success: true, path: exportDir };
  } catch (error) {
    console.error('Error exporting project files:', error);
    return { success: false, error: error.message };
  }
};
