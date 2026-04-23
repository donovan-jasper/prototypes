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
}

export async function loadEpubContent(filePath: string, currentPage: number = 0): Promise<EpubContent> {
  try {
    // Read the EPUB file
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Unzip the EPUB file
    const zip = new JSZip();
    const unzipped = await zip.loadAsync(fileContent, { base64: true });

    // Find the container file to locate the OPF file
    const containerXml = await unzipped.file('META-INF/container.xml')?.async('text');
    if (!containerXml) {
      throw new Error('Invalid EPUB: container.xml not found');
    }

    // Extract the path to the OPF file
    const opfPathMatch = containerXml.match(/full-path="([^"]+)"/);
    if (!opfPathMatch) {
      throw new Error('Invalid EPUB: OPF path not found in container.xml');
    }
    const opfPath = opfPathMatch[1];

    // Read the OPF file
    const opfContent = await unzipped.file(opfPath)?.async('text');
    if (!opfContent) {
      throw new Error('Invalid EPUB: OPF file not found');
    }

    // Parse metadata from OPF
    const metadata = parseMetadata(opfContent);

    // Parse spine (reading order) from OPF
    const spine = parseSpine(opfContent);

    // Extract chapters
    const chapters: EpubChapter[] = [];
    for (const item of spine) {
      const chapterPath = item.href;
      const chapterContent = await unzipped.file(chapterPath)?.async('text');
      if (chapterContent) {
        chapters.push({
          id: item.id,
          href: chapterPath,
          content: chapterContent,
        });
      }
    }

    // Find cover image if available
    if (metadata.coverId) {
      const coverItem = spine.find(item => item.id === metadata.coverId);
      if (coverItem) {
        const coverPath = coverItem.href;
        const coverContent = await unzipped.file(coverPath)?.async('base64');
        if (coverContent) {
          metadata.coverPath = `data:image/jpeg;base64,${coverContent}`;
        }
      }
    }

    return {
      metadata,
      chapters,
      currentChapter: Math.min(currentPage, chapters.length - 1),
    };
  } catch (error) {
    console.error('Error loading EPUB:', error);
    throw error;
  }
}

function parseMetadata(opfContent: string): {
  title: string;
  author: string;
  language?: string;
  coverId?: string;
} {
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/);
  const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/);
  const languageMatch = opfContent.match(/<dc:language[^>]*>([^<]+)<\/dc:language>/);
  const coverMatch = opfContent.match(/<meta[^>]*name="cover"[^>]*content="([^"]+)"/);

  return {
    title: titleMatch ? titleMatch[1] : 'Unknown Title',
    author: authorMatch ? authorMatch[1] : 'Unknown Author',
    language: languageMatch ? languageMatch[1] : undefined,
    coverId: coverMatch ? coverMatch[1] : undefined,
  };
}

function parseSpine(opfContent: string): Array<{ id: string; href: string }> {
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/);
  if (!spineMatch) {
    return [];
  }

  const spineContent = spineMatch[1];
  const itemRefs = spineContent.match(/<itemref[^>]*idref="([^"]+)"[^>]*>/g) || [];

  const items: Array<{ id: string; href: string }> = [];

  itemRefs.forEach(itemRef => {
    const idMatch = itemRef.match(/idref="([^"]+)"/);
    if (idMatch) {
      const id = idMatch[1];
      // Find the corresponding item in the manifest
      const manifestMatch = opfContent.match(new RegExp(`<item[^>]*id="${id}"[^>]*href="([^"]+)"`));
      if (manifestMatch) {
        items.push({
          id,
          href: manifestMatch[1],
        });
      }
    }
  });

  return items;
}
