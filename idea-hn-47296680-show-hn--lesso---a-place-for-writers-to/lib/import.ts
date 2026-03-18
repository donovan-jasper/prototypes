import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

interface ExtractedContent {
  title: string;
  body: string;
}

export const extractContentFromURL = async (url: string): Promise<ExtractedContent> => {
  if (!url || !url.trim()) {
    throw new Error('URL is required');
  }

  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CourseKit/1.0)',
    },
    timeout: 10000,
  });

  const html = response.data;

  let title = '';
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match) {
    title = h1Match[1].replace(/<[^>]*>/g, '').trim();
  } else {
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
    }
  }

  let body = '';
  const articleMatch = html.match(/<article[^>]*>(.*?)<\/article>/is);
  if (articleMatch) {
    body = articleMatch[1];
  } else {
    const pMatches = html.match(/<p[^>]*>.*?<\/p>/gi);
    if (pMatches) {
      body = pMatches.join('\n\n');
    }
  }

  body = body.replace(/<script[^>]*>.*?<\/script>/gi, '');
  body = body.replace(/<style[^>]*>.*?<\/style>/gi, '');
  body = body.replace(/<[^>]*>/g, '');
  body = body.replace(/&nbsp;/g, ' ');
  body = body.replace(/&amp;/g, '&');
  body = body.replace(/&lt;/g, '<');
  body = body.replace(/&gt;/g, '>');
  body = body.replace(/&quot;/g, '"');
  body = body.replace(/&#39;/g, "'");
  body = body.replace(/\n\s*\n\s*\n/g, '\n\n');
  body = body.trim();

  if (!title || !body) {
    throw new Error('Could not extract title or body from HTML');
  }

  return { title, body };
};

export const convertFileToText = async (): Promise<{ title: string; content: string }> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    throw new Error('File selection cancelled');
  }

  const file = result.assets[0];
  const fileUri = file.uri;
  const fileName = file.name;
  const mimeType = file.mimeType;

  let content = '';
  let title = fileName.replace(/\.[^/.]+$/, '');

  if (mimeType === 'text/plain') {
    content = await FileSystem.readAsStringAsync(fileUri);
  } else if (mimeType === 'application/pdf') {
    const base64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    content = `PDF content from ${fileName}\n\nNote: Full PDF text extraction requires backend processing. Please use the URL import or plain text files for now.`;
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    content = `DOCX content from ${fileName}\n\nNote: Full DOCX text extraction requires backend processing. Please use the URL import or plain text files for now.`;
  } else {
    throw new Error('Unsupported file type');
  }

  return { title, content };
};

export const splitContentIntoLessons = (content: string): Array<{ title: string; content: string }> => {
  const lessons: Array<{ title: string; content: string }> = [];
  
  const sections = content.split(/(?=^#{1,2}\s+.+$)/m);
  
  sections.forEach((section, index) => {
    const trimmed = section.trim();
    if (!trimmed) return;
    
    const headerMatch = trimmed.match(/^#{1,2}\s+(.+)$/m);
    let lessonTitle = '';
    let lessonContent = trimmed;
    
    if (headerMatch) {
      lessonTitle = headerMatch[1].trim();
      lessonContent = trimmed.replace(/^#{1,2}\s+.+$/m, '').trim();
    } else {
      lessonTitle = `Lesson ${index + 1}`;
    }
    
    if (lessonContent.length > 0) {
      lessons.push({
        title: lessonTitle,
        content: lessonContent,
      });
    }
  });
  
  if (lessons.length === 0 && content.trim().length > 0) {
    lessons.push({
      title: 'Lesson 1',
      content: content.trim(),
    });
  }
  
  return lessons;
};
