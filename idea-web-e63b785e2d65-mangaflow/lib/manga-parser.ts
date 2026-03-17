import JSZip from 'jszip';
import * as FileSystem from 'expo-file-system';
import { savePage } from './storage';

export interface MangaMetadata {
  title: string;
  series?: string;
  volume?: number;
  chapter?: number;
}

export function detectMetadata(filename: string): MangaMetadata {
  const cleanName = filename.replace(/\.(cbz|zip|cbr)$/i, '');
  
  const volumeMatch = cleanName.match(/vol\.?\s*(\d+)/i);
  const chapterMatch = cleanName.match(/ch\.?\s*(\d+)/i);
  
  let title = cleanName;
  if (volumeMatch || chapterMatch) {
    title = cleanName.split(/vol\.?|ch\.?/i)[0].trim();
  }
  
  return {
    title: title || 'Untitled Manga',
    series: title,
    volume: volumeMatch ? parseInt(volumeMatch[1]) : undefined,
    chapter: chapterMatch ? parseInt(chapterMatch[1]) : undefined,
  };
}

export async function extractMangaArchive(uri: string): Promise<{
  pages: string[];
  coverUri: string;
  totalPages: number;
  mangaId: string;
}> {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  const zip = await JSZip.loadAsync(base64, { base64: true });
  
  const imageFiles = Object.keys(zip.files)
    .filter((filename) => {
      const lower = filename.toLowerCase();
      return (
        !filename.startsWith('__MACOSX') &&
        !filename.startsWith('.') &&
        (lower.endsWith('.jpg') ||
          lower.endsWith('.jpeg') ||
          lower.endsWith('.png') ||
          lower.endsWith('.webp'))
      );
    })
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
  
  if (imageFiles.length === 0) {
    throw new Error('No images found in archive');
  }
  
  const mangaId = `manga-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const pages: string[] = [];
  
  for (let i = 0; i < imageFiles.length; i++) {
    const file = zip.files[imageFiles[i]];
    const imageData = await file.async('base64');
    const pageUri = await savePage(mangaId, i, imageData);
    pages.push(pageUri);
  }
  
  return {
    pages,
    coverUri: pages[0],
    totalPages: pages.length,
    mangaId,
  };
}
