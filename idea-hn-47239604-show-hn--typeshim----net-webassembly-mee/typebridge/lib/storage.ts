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
    // In a real implementation, we'd fetch from the database
    // For now, we'll simulate by getting all projects and finding the matching one
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

    // Write the project code to a file
    const codeFile = `${exportDir}/code.ts`;
    await FileSystem.writeAsStringAsync(codeFile, project.code);

    // If we have WASM bytes, write them too
    if (project.wasmBytes) {
      const wasmFile = `${exportDir}/app.wasm`;
      await FileSystem.writeAsStringAsync(wasmFile, String.fromCharCode(...project.wasmBytes), {
        encoding: FileSystem.EncodingType.UTF8,
      });
    }

    return { success: true, path: exportDir };
  } catch (error) {
    console.error('Error exporting project files:', error);
    return { success: false, error: error.message };
  }
};
