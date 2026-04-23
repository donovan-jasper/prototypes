import * as FileSystem from 'expo-file-system';
import { parseUrl } from './parser';
import { ContentType } from '@/types';

const VIDEOS_DIR = `${FileSystem.documentDirectory}media/videos/`;
const IMAGES_DIR = `${FileSystem.documentDirectory}media/images/`;
const ARTICLES_DIR = `${FileSystem.documentDirectory}media/articles/`;

export interface DownloadResult {
  fileUri: string;
  thumbnailUri?: string;
  title: string;
  source: string;
  type: ContentType;
  fileSize: number;
  duration?: number;
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-z0-9_\-\.]/gi, '_').substring(0, 200);
}

function getFileExtension(url: string, type: ContentType): string {
  const urlLower = url.toLowerCase();

  if (type === 'video') {
    if (urlLower.includes('.mp4')) return '.mp4';
    if (urlLower.includes('.webm')) return '.webm';
    if (urlLower.includes('.mov')) return '.mov';
    return '.mp4';
  }

  if (type === 'image') {
    if (urlLower.includes('.jpg') || urlLower.includes('.jpeg')) return '.jpg';
    if (urlLower.includes('.png')) return '.png';
    if (urlLower.includes('.gif')) return '.gif';
    if (urlLower.includes('.webp')) return '.webp';
    return '.jpg';
  }

  return '.html';
}

function getDirectoryForType(type: ContentType): string {
  switch (type) {
    case 'video':
      return VIDEOS_DIR;
    case 'image':
      return IMAGES_DIR;
    case 'article':
      return ARTICLES_DIR;
  }
}

export async function downloadMedia(
  url: string,
  onProgress?: (progress: number, total: number) => void
): Promise<DownloadResult> {
  const parsed = parseUrl(url);
  const timestamp = Date.now();
  const extension = getFileExtension(url, parsed.type);
  const filename = `${sanitizeFilename(parsed.title)}_${timestamp}${extension}`;
  const directory = getDirectoryForType(parsed.type);
  const fileUri = `${directory}${filename}`;

  // Ensure directory exists
  await FileSystem.makeDirectoryAsync(directory, { intermediates: true });

  let downloadUrl = parsed.downloadUrl || url;

  if (parsed.type === 'article') {
    const response = await fetch(url);
    const html = await response.text();
    await FileSystem.writeAsStringAsync(fileUri, html);

    const fileInfo = await FileSystem.getInfoAsync(fileUri);

    return {
      fileUri,
      title: parsed.title,
      source: parsed.source,
      type: parsed.type,
      fileSize: fileInfo.size || 0,
    };
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    downloadUrl,
    fileUri,
    {},
    (downloadProgress) => {
      if (onProgress) {
        onProgress(
          downloadProgress.totalBytesWritten,
          downloadProgress.totalBytesExpectedToWrite
        );
      }
    }
  );

  const result = await downloadResumable.downloadAsync();

  if (!result) {
    throw new Error('Download failed');
  }

  const fileInfo = await FileSystem.getInfoAsync(result.uri);

  // For videos, generate a thumbnail
  let thumbnailUri: string | undefined;
  if (parsed.type === 'video') {
    // In a real implementation, we would use expo-av or another library to generate a thumbnail
    // For MVP, we'll just use a placeholder
    thumbnailUri = `${directory}${sanitizeFilename(parsed.title)}_${timestamp}_thumb.jpg`;
    // Create a placeholder thumbnail
    await FileSystem.writeAsStringAsync(thumbnailUri, '');
  }

  return {
    fileUri: result.uri,
    thumbnailUri,
    title: parsed.title,
    source: parsed.source,
    type: parsed.type,
    fileSize: fileInfo.size || 0,
  };
}
