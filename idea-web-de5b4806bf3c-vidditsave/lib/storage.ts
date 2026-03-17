import * as FileSystem from 'expo-file-system';

const MEDIA_DIR = `${FileSystem.documentDirectory}media/`;
const VIDEOS_DIR = `${MEDIA_DIR}videos/`;
const IMAGES_DIR = `${MEDIA_DIR}images/`;
const ARTICLES_DIR = `${MEDIA_DIR}articles/`;

export async function initStorage() {
  await ensureDirectoryExists(MEDIA_DIR);
  await ensureDirectoryExists(VIDEOS_DIR);
  await ensureDirectoryExists(IMAGES_DIR);
  await ensureDirectoryExists(ARTICLES_DIR);
}

async function ensureDirectoryExists(dir: string) {
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

export async function saveFile(filename: string, data: string, type: 'video' | 'image' | 'article'): Promise<string> {
  let dir: string;
  switch (type) {
    case 'video':
      dir = VIDEOS_DIR;
      break;
    case 'image':
      dir = IMAGES_DIR;
      break;
    case 'article':
      dir = ARTICLES_DIR;
      break;
  }
  
  const uri = `${dir}${filename}`;
  await FileSystem.writeAsStringAsync(uri, data);
  return uri;
}

export async function deleteFile(uri: string): Promise<void> {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (fileInfo.exists) {
    await FileSystem.deleteAsync(uri);
  }
}

export async function getFileUri(filename: string, type: 'video' | 'image' | 'article'): Promise<string | null> {
  let dir: string;
  switch (type) {
    case 'video':
      dir = VIDEOS_DIR;
      break;
    case 'image':
      dir = IMAGES_DIR;
      break;
    case 'article':
      dir = ARTICLES_DIR;
      break;
  }
  
  const uri = `${dir}${filename}`;
  const fileInfo = await FileSystem.getInfoAsync(uri);
  return fileInfo.exists ? uri : null;
}

export async function downloadFile(
  url: string,
  filename: string,
  type: 'video' | 'image' | 'article',
  onProgress?: (progress: number, total: number) => void
): Promise<string> {
  let dir: string;
  switch (type) {
    case 'video':
      dir = VIDEOS_DIR;
      break;
    case 'image':
      dir = IMAGES_DIR;
      break;
    case 'article':
      dir = ARTICLES_DIR;
      break;
  }
  
  const uri = `${dir}${filename}`;
  
  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    uri,
    {},
    (downloadProgress) => {
      if (onProgress) {
        onProgress(downloadProgress.totalBytesWritten, downloadProgress.totalBytesExpectedToWrite);
      }
    }
  );
  
  const result = await downloadResumable.downloadAsync();
  if (!result) {
    throw new Error('Download failed');
  }
  
  return result.uri;
}
