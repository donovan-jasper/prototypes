import * as FileSystem from 'expo-file-system';
import { loadEpubContent } from './epubParser';

export interface BookMetadata {
  title: string;
  author: string;
  format: string;
  coverPath?: string;
}

export async function extractMetadata(
  filePath: string,
  format: string
): Promise<BookMetadata> {
  const filename = filePath.split('/').pop() || 'Unknown';
  const baseTitle = filename.replace(/\.(epub|pdf|mobi|txt)$/i, '');
  
  if (format.toLowerCase() === 'epub') {
    return extractEpubMetadata(filePath, baseTitle);
  } else if (format.toLowerCase() === 'pdf') {
    return extractPdfMetadata(filePath, baseTitle);
  } else {
    return {
      title: baseTitle,
      author: 'Unknown Author',
      format: format.toLowerCase()
    };
  }
}

async function extractEpubMetadata(filePath: string, fallbackTitle: string): Promise<BookMetadata> {
  try {
    const epubContent = await loadEpubContent(filePath, 0);
    
    return {
      title: epubContent.metadata.title !== 'Unknown' ? epubContent.metadata.title : fallbackTitle,
      author: epubContent.metadata.author,
      format: 'epub',
      coverPath: epubContent.metadata.coverHref
    };
  } catch (error) {
    console.error('Failed to extract EPUB metadata:', error);
    return {
      title: fallbackTitle,
      author: 'Unknown Author',
      format: 'epub'
    };
  }
}

async function extractPdfMetadata(filePath: string, fallbackTitle: string): Promise<BookMetadata> {
  return {
    title: fallbackTitle,
    author: 'Unknown Author',
    format: 'pdf'
  };
}
