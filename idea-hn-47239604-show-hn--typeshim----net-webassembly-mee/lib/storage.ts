import * as FileSystem from 'expo-file-system';
import Database from './database';

interface Project {
  id: string;
  name: string;
  code: string;
  wasmBytes?: Uint8Array;
  createdAt: number;
  updatedAt: number;
}

class Storage {
  private static instance: Storage;
  private db: Database;

  private constructor() {
    this.db = Database.getInstance();
  }

  public static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  public async saveProject(project: Project): Promise<{ success: boolean; error?: string }> {
    try {
      if (project.id) {
        await this.db.updateProject(project.id, {
          name: project.name,
          code: project.code,
          wasmBytes: project.wasmBytes
        });
      } else {
        const newProject = await this.db.createProject({
          name: project.name,
          code: project.code,
          wasmBytes: project.wasmBytes
        });
        project.id = newProject.id;
      }

      // Save WASM bytes to file system if they exist
      if (project.wasmBytes) {
        const wasmPath = `${FileSystem.documentDirectory}projects/${project.id}/module.wasm`;
        await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}projects/${project.id}`, { intermediates: true });
        await FileSystem.writeAsStringAsync(wasmPath, project.wasmBytes.toString(), {
          encoding: FileSystem.EncodingType.Base64
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  public async loadProject(id: string): Promise<Project | null> {
    try {
      const project = await this.db.getProject(id);
      if (!project) return null;

      // Load WASM bytes from file system if they exist
      const wasmPath = `${FileSystem.documentDirectory}projects/${id}/module.wasm`;
      if (await FileSystem.getInfoAsync(wasmPath).then(info => info.exists)) {
        const wasmContent = await FileSystem.readAsStringAsync(wasmPath, {
          encoding: FileSystem.EncodingType.Base64
        });
        project.wasmBytes = new Uint8Array(Buffer.from(wasmContent, 'base64'));
      }

      return project;
    } catch (error) {
      console.error('Error loading project:', error);
      return null;
    }
  }

  public async deleteProject(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.db.deleteProject(id);

      // Delete WASM file if it exists
      const wasmPath = `${FileSystem.documentDirectory}projects/${id}/module.wasm`;
      if (await FileSystem.getInfoAsync(wasmPath).then(info => info.exists)) {
        await FileSystem.deleteAsync(wasmPath);
      }

      // Delete project directory
      const projectDir = `${FileSystem.documentDirectory}projects/${id}`;
      if (await FileSystem.getInfoAsync(projectDir).then(info => info.exists)) {
        await FileSystem.deleteAsync(projectDir, { idempotent: true });
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  public async exportProjectFiles(project: Project): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      const exportDir = `${FileSystem.documentDirectory}exports/${project.id}`;
      await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

      // Create index.html
      const indexHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>${project.name}</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body>
            <script>
              // Load WASM module
              fetch('module.wasm')
                .then(response => response.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes))
                .then(results => {
                  console.log('WASM module loaded:', results);
                })
                .catch(error => {
                  console.error('Error loading WASM module:', error);
                });
            </script>
          </body>
        </html>
      `;
      await FileSystem.writeAsStringAsync(`${exportDir}/index.html`, indexHtml);

      // Create manifest.json
      const manifest = {
        name: project.name,
        short_name: project.name,
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000'
      };
      await FileSystem.writeAsStringAsync(`${exportDir}/manifest.json`, JSON.stringify(manifest, null, 2));

      // Save WASM bytes
      if (project.wasmBytes) {
        await FileSystem.writeAsStringAsync(`${exportDir}/module.wasm`, project.wasmBytes.toString(), {
          encoding: FileSystem.EncodingType.Base64
        });
      }

      // Create zip file
      const zipUri = `${exportDir}.zip`;
      await FileSystem.downloadAsync(
        FileSystem.documentDirectory + 'exports/' + project.id,
        zipUri
      );

      return { success: true, uri: zipUri };
    } catch (error) {
      console.error('Error exporting project:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

export default Storage.getInstance();
