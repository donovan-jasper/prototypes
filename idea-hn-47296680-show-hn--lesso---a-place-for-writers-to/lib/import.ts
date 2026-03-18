import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

interface ExtractedContent {
  title: string;
  body: string;
}

export const extractContentFromURL = async (url: string): Promise<ExtractedContent> => {
  const response = await fetch(url);
  const html = await response.text();

  // Extract title from <h1> or <title>
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

  // Extract body from <article> or all <p> tags
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

  // Clean HTML tags and entities
  body = body.replace(/<[^>]*>/g, '').trim();
  body = body.replace(/&nbsp;/g, ' ');
  body = body.replace(/&amp;/g, '&');
  body = body.replace(/&lt;/g, '<');
  body = body.replace(/&gt;/g, '>');
  body = body.replace(/&quot;/g, '"');

  if (!title || !body) {
    throw new Error('Could not extract title or body from HTML');
  }

  return { title, body };
};

export const convertFileToText = async (): Promise<{ title: string; content: string }> => {
  const
