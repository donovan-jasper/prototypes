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

  let downloadUrl = url;
  
  if (parsed.type === 'video') {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      throw new Error('YouTube downloads require additional setup. For MVP, please use direct video URLs.');
    }
    if (url.includes('tiktok.com') || url.includes('instagram.com')) {
      throw new Error('Social media downloads require additional setup. For MVP, please use direct video URLs.');
    }
  }

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

  return {
    fileUri: result.uri,
    title: parsed.title,
    source: parsed.source,
    type: parsed.type,
    fileSize: fileInfo.size || 0,
  };
}
