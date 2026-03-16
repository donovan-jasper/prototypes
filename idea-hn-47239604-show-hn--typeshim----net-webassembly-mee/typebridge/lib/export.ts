import * as FileSystem from 'expo-file-system';

export const generateManifest = (project) => {
  return {
    name: project.name,
    short_name: project.name,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6200ee',
  };
};

export const exportToPWA = async (project) => {
  try {
    const manifest = generateManifest(project);
    const indexHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>${project.name}</title>
          <link rel="manifest" href="manifest.json">
        </head>
        <body>
          <script>
            // WASM execution code
          </script>
        </body>
      </html>
    `;

    const files = {
      'index.html': indexHtml,
      'manifest.json': JSON.stringify(manifest),
      'app.wasm': project.wasmBytes,
    };

    const exportDir = `${FileSystem.documentDirectory}exports/${project.id}`;
    await FileSystem.makeDirectoryAsync(exportDir, { intermediates: true });

    for (const [filename, content] of Object.entries(files)) {
      await FileSystem.writeAsStringAsync(`${exportDir}/${filename}`, content);
    }

    return { success: true, files: Object.keys(files) };
  } catch (error) {
    return { success: false, error };
  }
};
