const JSZip = require('jszip');

class ArchiveConverter {
  static async convert(files) {
    try {
      // Get conversion options
      const action = document.getElementById('actionSelect').value;

      // Process based on action
      let result;
      switch (action) {
        case 'create':
          result = await this.createZip(files);
          break;
        case 'extract':
          result = await this.extractZip(files[0]);
          break;
        default:
          throw new Error('Invalid archive action');
      }

      return result;
    } catch (error) {
      UIManager.showError(error.message);
      throw error;
    }
  }

  static async createZip(files) {
    const zip = new JSZip();

    for (const file of files) {
      const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
      zip.file(file.name, arrayBuffer);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const filename = 'archive.zip';

    return { blob: content, filename };
  }

  static async extractZip(file) {
    // Validate file type
    const allowedTypes = ['application/zip'];
    fileHandler.validateFile(file, allowedTypes);

    const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
    const zip = await JSZip.loadAsync(arrayBuffer);

    const extractedFiles = [];
    zip.forEach((relativePath, zipEntry) => {
      extractedFiles.push({
        name: relativePath,
        async: zipEntry.async('blob')
      });
    });

    // Create a new ZIP with all extracted files
    const newZip = new JSZip();
    for (const file of extractedFiles) {
      const blob = await file.async;
      newZip.file(file.name, blob);
    }

    const content = await newZip.generateAsync({ type: 'blob' });
    const filename = 'extracted_files.zip';

    return { blob: content, filename };
  }
}
