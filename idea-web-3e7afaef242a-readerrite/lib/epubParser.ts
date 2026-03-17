import * as FileSystem from 'expo-file-system';

export interface EpubContent {
  chapters: string[];
  currentChapter: number;
}

export async function loadEpubContent(
  filePath: string,
  savedChapter: number = 0
): Promise<EpubContent> {
  try {
    const fileContent = await FileSystem.readAsStringAsync(filePath);
    
    const chapters = parseEpubToChapters(fileContent);
    
    return {
      chapters,
      currentChapter: Math.min(savedChapter, chapters.length - 1)
    };
  } catch (error) {
    console.error('Failed to load EPUB content:', error);
    return {
      chapters: ['<p>Failed to load book content. The file may be corrupted.</p>'],
      currentChapter: 0
    };
  }
}

function parseEpubToChapters(content: string): string[] {
  const chapterRegex = /<chapter[^>]*>([\s\S]*?)<\/chapter>/gi;
  const matches = content.match(chapterRegex);
  
  if (matches && matches.length > 0) {
    return matches.map(chapter => {
      return chapter.replace(/<\/?chapter[^>]*>/gi, '').trim();
    });
  }
  
  const paragraphRegex = /<p[^>]*>[\s\S]*?<\/p>/gi;
  const paragraphs = content.match(paragraphRegex);
  
  if (paragraphs && paragraphs.length > 0) {
    const chaptersPerPage = 10;
    const chapters: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i += chaptersPerPage) {
      const chapterContent = paragraphs.slice(i, i + chaptersPerPage).join('\n');
      chapters.push(chapterContent);
    }
    
    return chapters.length > 0 ? chapters : ['<p>No readable content found in this book.</p>'];
  }
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
  
  if (sentences.length > 0) {
    const chaptersPerPage = 5;
    const chapters: string[] = [];
    
    for (let i = 0; i < sentences.length; i += chaptersPerPage) {
      const chapterContent = sentences
        .slice(i, i + chaptersPerPage)
        .map(s => `<p>${s.trim()}.</p>`)
        .join('\n');
      chapters.push(chapterContent);
    }
    
    return chapters.length > 0 ? chapters : ['<p>No readable content found in this book.</p>'];
  }
  
  return ['<p>This EPUB file format is not yet supported. Please try a different file.</p>'];
}
