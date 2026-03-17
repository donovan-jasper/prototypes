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
    return {
      title: fallbackTitle,
      author: 'Unknown Author',
      format: 'epub'
    };
  } catch (error) {
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
