import * as FileSystem from 'expo-file-system';

const BOOKS_DIR = `${FileSystem.documentDirectory}books/`;

export async function ensureBooksDirectory(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(BOOKS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BOOKS_DIR, { intermediates: true });
  }
}

export async function saveBookFile(filename: string, sourceUri: string): Promise<string> {
  await ensureBooksDirectory();
  
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  const uniqueFilename = `${timestamp}_${sanitizedFilename}`;
  const destPath = `${BOOKS_DIR}${uniqueFilename}`;
  
  await FileSystem.copyAsync({
    from: sourceUri,
    to: destPath
  });
  
  return destPath;
}

export async function loadBookFile(path: string): Promise<string> {
  const fileInfo = await FileSystem.getInfoAsync(path);
  
  if (!fileInfo.exists) {
    throw new Error('File not found');
  }
  
  const content = await FileSystem.readAsStringAsync(path);
  return content;
}

export async function deleteBookFile(path: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(path);
  
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(path);
  }
}

export async function getFileSize(path: string): Promise<number> {
  const fileInfo = await FileSystem.getInfoAsync(path);
  return fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
}
