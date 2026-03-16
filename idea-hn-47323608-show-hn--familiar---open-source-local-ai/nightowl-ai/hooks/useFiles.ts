import { useState, useEffect } from 'react';
import { FileManager } from '@/services/storage/fileManager';

export function useFiles() {
  const [files, setFiles] = useState<Array<{ id: string; uri: string; type: string; category?: string }>>([]);
  const [fileManager] = useState(new FileManager());

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const photos = await fileManager.scanPhotos();
      const documents = await fileManager.scanDocuments();
      const allFiles = [...photos, ...documents];

      const categorized = await fileManager.categorizeFiles(allFiles);
      setFiles([...categorized.photos, ...categorized.documents]);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const searchFiles = (query: string) => {
    // Implement search functionality
    // This is a simplified version
    return files.filter(file =>
      file.category?.toLowerCase().includes(query.toLowerCase()) ||
      file.type.toLowerCase().includes(query.toLowerCase())
    );
  };

  return {
    files,
    searchFiles,
  };
}
