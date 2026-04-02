import JSZip from 'jszip';

class ArchiveConverter {
  static async createZip(files, uiManager) {
    uiManager.showProgress(0, 'Creating ZIP archive...');
    
    try {
      const zip = new JSZip();
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        uiManager.showProgress(
          Math.floor((i / files.length) * 80),
          `Adding file ${i + 1} of ${files.length}`
        );
        
        const arrayBuffer = await this.readFileAsArrayBuffer(file);
        zip.file(file.name, arrayBuffer);
      }
      
      uiManager.showProgress(90, 'Generating ZIP file...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      uiManager.showProgress(100, 'Complete!');
      uiManager.showSuccess('ZIP archive created successfully!');
      
      return { blob: zipBlob, filename: 'archive.zip' };
    } catch (error) {
      uiManager.showError(`ZIP creation failed: ${error.message}`);
      throw error;
    }
  }

  static async extractZip(file, uiManager, fileHandler) {
    uiManager.showProgress(0, 'Loading ZIP file...');
    
    try {
      const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      uiManager.showProgress(30, 'Extracting files...');
      
      const extractedFiles = [];
      const entries = Object.entries(zip.files);
      
      for (let i = 0; i < entries.length; i++) {
        const [filename, zipEntry] = entries[i];
        
        if (!zipEntry.dir) { // Skip directories
          uiManager.showProgress(
            Math.floor(30 + (i / entries.length) * 60),
            `Extracting ${i + 1} of ${entries.filter(e => !e[1].dir).length}`
          );
          
          const fileData = await zipEntry.async('arraybuffer');
          const fileBlob = new Blob([fileData]);
          const extractedFile = new File([fileBlob], filename, { type: this.getMimeType(filename) });
          extractedFiles.push(extractedFile);
        }
      }
      
      uiManager.showProgress(100, 'Complete!');
      uiManager.showSuccess(`${extractedFiles.length} files extracted successfully!`);
      
      // For extraction, we'll return the first file as a demo
      // In a real implementation, we might create a new ZIP with extracted files
      if (extractedFiles.length > 0) {
        const zipForExtraction = new JSZip();
        for (const file of extractedFiles) {
          const arrayBuffer = await this.readFileAsArrayBuffer(file);
          zipForExtraction.file(file.name, arrayBuffer);
        }
        const extractedZipBlob = await zipForExtraction.generateAsync({ type: 'blob' });
        return { blob: extractedZipBlob, filename: 'extracted.zip' };
      } else {
        throw new Error('No files found in ZIP archive');
      }
    } catch (error) {
      uiManager.showError(`ZIP extraction failed: ${error.message}`);
      throw error;
    }
  }

  static async addToZip(zip, file, path) {
    const arrayBuffer = await this.readFileAsArrayBuffer(file);
    zip.file(path + file.name, arrayBuffer);
  }

  static readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  static getMimeType(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      'txt': 'text/plain',
      'html': 'text/html',
      'css': 'text/css',
      'js': 'application/javascript',
      'json': 'application/json',
      'xml': 'application/xml',
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'zip': 'application/zip',
      'csv': 'text/csv'
    };
    
    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export default ArchiveConverter;
