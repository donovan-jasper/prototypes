import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

export interface EpubChapter {
  id: string;
  href: string;
  content: string;
}

export interface EpubContent {
  metadata: {
    title: string;
    author: string;
    language?: string;
    coverPath?: string;
  };
  chapters: EpubChapter[];
  currentChapter: number;
  css: string;
}

export async function loadEpubContent(filePath: string, currentPage: number = 0): Promise<EpubContent> {
  try {
    // Read the EPUB file
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to binary
    const binaryString = atob(fileContent);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Unzip the EPUB
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(bytes);

    // Find the container file
    const containerFile = zipContent.file('META-INF/container.xml');
    if (!containerFile) {
      throw new Error('Invalid EPUB: container.xml not found');
    }

    const containerXml = await containerFile.async('text');
    const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
    if (!opfPathMatch) {
      throw new Error('Invalid EPUB: OPF path not found in container.xml');
    }

    const opfPath = opfPathMatch[1];
    const opfFile = zipContent.file(opfPath);
    if (!opfFile) {
      throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`);
    }

    const opfXml = await opfFile.async('text');
    const parser = new DOMParser();
    const opfDoc = parser.parseFromString(opfXml, 'application/xml');

    // Extract metadata
    const metadata = extractMetadata(opfDoc);

    // Extract CSS
    const css = await extractCss(opfDoc, zipContent);

    // Extract chapters from spine
    const chapters = await extractChapters(opfDoc, zipContent);

    // Ensure currentPage is within bounds
    const safeCurrentPage = Math.min(Math.max(currentPage, 0), chapters.length - 1);

    return {
      metadata,
      chapters,
      currentChapter: safeCurrentPage,
      css,
    };
  } catch (error) {
    console.error('Error loading EPUB:', error);
    throw error;
  }
}

function extractMetadata(opfDoc: Document): EpubContent['metadata'] {
  const titleElement = opfDoc.querySelector('dc\\:title, title');
  const authorElement = opfDoc.querySelector('dc\\:creator, creator');
  const languageElement = opfDoc.querySelector('dc\\:language, language');
  const coverElement = opfDoc.querySelector('meta[name="cover"]');

  let coverPath = undefined;
  if (coverElement) {
    const coverId = coverElement.getAttribute('content');
    if (coverId) {
      const itemElement = opfDoc.querySelector(`item[id="${coverId}"]`);
      if (itemElement) {
        coverPath = itemElement.getAttribute('href');
      }
    }
  }

  return {
    title: titleElement?.textContent || 'Unknown Title',
    author: authorElement?.textContent || 'Unknown Author',
    language: languageElement?.textContent,
    coverPath,
  };
}

async function extractCss(opfDoc: Document, zipContent: JSZip): Promise<string> {
  const manifest = opfDoc.querySelector('manifest');
  if (!manifest) {
    return '';
  }

  let cssContent = '';
  const cssItems = Array.from(manifest.querySelectorAll('item[media-type="text/css"]'));

  for (const item of cssItems) {
    const href = item.getAttribute('href');
    if (!href) continue;

    // Get the full path by combining with the OPF directory
    const opfPath = opfDoc.documentURI || '';
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    const fullPath = opfDir + href;

    const cssFile = zipContent.file(fullPath);
    if (!cssFile) continue;

    const content = await cssFile.async('text');
    cssContent += content + '\n';
  }

  return cssContent;
}

async function extractChapters(opfDoc: Document, zipContent: JSZip): Promise<EpubChapter[]> {
  const spine = opfDoc.querySelector('spine');
  if (!spine) {
    throw new Error('Invalid EPUB: spine not found in OPF');
  }

  const manifest = opfDoc.querySelector('manifest');
  if (!manifest) {
    throw new Error('Invalid EPUB: manifest not found in OPF');
  }

  const chapters: EpubChapter[] = [];
  const itemRefs = Array.from(spine.querySelectorAll('itemref'));

  for (const itemRef of itemRefs) {
    const idref = itemRef.getAttribute('idref');
    if (!idref) continue;

    const item = manifest.querySelector(`item[id="${idref}"]`);
    if (!item) continue;

    const href = item.getAttribute('href');
    if (!href) continue;

    // Get the full path by combining with the OPF directory
    const opfPath = opfDoc.documentURI || '';
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    const fullPath = opfDir + href;

    const chapterFile = zipContent.file(fullPath);
    if (!chapterFile) continue;

    const content = await chapterFile.async('text');
    chapters.push({
      id: idref,
      href,
      content,
    });
  }

  return chapters;
}
