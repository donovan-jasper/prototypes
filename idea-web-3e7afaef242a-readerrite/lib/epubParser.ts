import * as FileSystem from 'expo-file-system';
import JSZip from 'jszip';

export interface EpubChapter {
  id: string;
  href: string;
  title: string;
  content: string;
}

export interface EpubMetadata {
  title: string;
  author: string;
  coverHref?: string;
}

export interface EpubContent {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  currentChapter: number;
  toc: Array<{ title: string; href: string }>;
}

export async function loadEpubContent(
  filePath: string,
  savedChapter: number = 0
): Promise<EpubContent> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64
    });
    
    const zip = await JSZip.loadAsync(fileContent, { base64: true });
    
    const containerXml = await zip.file('META-INF/container.xml')?.async('text');
    if (!containerXml) {
      throw new Error('Invalid EPUB: container.xml not found');
    }
    
    const opfPath = extractOpfPath(containerXml);
    const opfContent = await zip.file(opfPath)?.async('text');
    if (!opfContent) {
      throw new Error('Invalid EPUB: OPF file not found');
    }
    
    const opfDir = opfPath.substring(0, opfPath.lastIndexOf('/') + 1);
    
    const metadata = extractMetadata(opfContent);
    const manifest = extractManifest(opfContent);
    const spine = extractSpine(opfContent);
    
    const chapters: EpubChapter[] = [];
    for (const spineItem of spine) {
      const manifestItem = manifest.find(m => m.id === spineItem.idref);
      if (manifestItem) {
        const chapterPath = opfDir + manifestItem.href;
        const chapterContent = await zip.file(chapterPath)?.async('text');
        
        if (chapterContent) {
          chapters.push({
            id: manifestItem.id,
            href: manifestItem.href,
            title: extractChapterTitle(chapterContent) || `Chapter ${chapters.length + 1}`,
            content: chapterContent
          });
        }
      }
    }
    
    const ncxItem = manifest.find(m => m.mediaType === 'application/x-dtbncx+xml');
    let toc: Array<{ title: string; href: string }> = [];
    
    if (ncxItem) {
      const ncxPath = opfDir + ncxItem.href;
      const ncxContent = await zip.file(ncxPath)?.async('text');
      if (ncxContent) {
        toc = extractTocFromNcx(ncxContent);
      }
    }
    
    if (toc.length === 0) {
      toc = chapters.map((ch, idx) => ({
        title: ch.title,
        href: ch.href
      }));
    }
    
    return {
      metadata,
      chapters,
      currentChapter: Math.min(savedChapter, chapters.length - 1),
      toc
    };
  } catch (error) {
    console.error('Failed to parse EPUB:', error);
    return {
      metadata: {
        title: 'Unknown',
        author: 'Unknown'
      },
      chapters: [{
        id: 'error',
        href: '',
        title: 'Error',
        content: '<p>Failed to load book content. The EPUB file may be corrupted or in an unsupported format.</p>'
      }],
      currentChapter: 0,
      toc: []
    };
  }
}

function extractOpfPath(containerXml: string): string {
  const match = containerXml.match(/full-path="([^"]+)"/);
  return match ? match[1] : 'content.opf';
}

function extractMetadata(opfContent: string): EpubMetadata {
  const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
  const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
  
  return {
    title: titleMatch ? titleMatch[1].trim() : 'Unknown',
    author: authorMatch ? authorMatch[1].trim() : 'Unknown'
  };
}

interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

function extractManifest(opfContent: string): ManifestItem[] {
  const manifestMatch = opfContent.match(/<manifest[^>]*>([\s\S]*?)<\/manifest>/i);
  if (!manifestMatch) return [];
  
  const manifestContent = manifestMatch[1];
  const itemRegex = /<item[^>]*id="([^"]*)"[^>]*href="([^"]*)"[^>]*media-type="([^"]*)"[^>]*\/?>/gi;
  
  const items: ManifestItem[] = [];
  let match;
  
  while ((match = itemRegex.exec(manifestContent)) !== null) {
    items.push({
      id: match[1],
      href: decodeURIComponent(match[2]),
      mediaType: match[3]
    });
  }
  
  return items;
}

interface SpineItem {
  idref: string;
}

function extractSpine(opfContent: string): SpineItem[] {
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i);
  if (!spineMatch) return [];
  
  const spineContent = spineMatch[1];
  const itemRefRegex = /<itemref[^>]*idref="([^"]*)"[^>]*\/?>/gi;
  
  const items: SpineItem[] = [];
  let match;
  
  while ((match = itemRefRegex.exec(spineContent)) !== null) {
    items.push({
      idref: match[1]
    });
  }
  
  return items;
}

function extractChapterTitle(htmlContent: string): string | null {
  const h1Match = htmlContent.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  
  const h2Match = htmlContent.match(/<h2[^>]*>([^<]+)<\/h2>/i);
  if (h2Match) return h2Match[1].trim();
  
  const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  
  return null;
}

function extractTocFromNcx(ncxContent: string): Array<{ title: string; href: string }> {
  const toc: Array<{ title: string; href: string }> = [];
  const navPointRegex = /<navPoint[^>]*>([\s\S]*?)<\/navPoint>/gi;
  
  let match;
  while ((match = navPointRegex.exec(ncxContent)) !== null) {
    const navPointContent = match[1];
    
    const textMatch = navPointContent.match(/<text>([^<]+)<\/text>/i);
    const srcMatch = navPointContent.match(/<content[^>]*src="([^"]+)"/i);
    
    if (textMatch && srcMatch) {
      toc.push({
        title: textMatch[1].trim(),
        href: srcMatch[1].split('#')[0]
      });
    }
  }
  
  return toc;
}
