import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist';
import { DocumentPicker } from 'expo-document-picker';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.10.377/build/pdf.worker.min.js';

interface ExtractedContent {
  title: string;
  body: string;
}

export const extractContentFromURL = async (url: string): Promise<ExtractedContent> => {
  const response = await axios.get(url);
  const html = response.data;
  const titleRegex = /<title>(.*?)<\/title>/;
  const bodyRegex = /<body>(.*?)<\/body>/;
  const titleMatch = html.match(titleRegex);
  const bodyMatch = html.match(bodyRegex);

  if (!titleMatch || !bodyMatch) {
    throw new Error('Could not extract title or body from HTML');
  }

  const title = titleMatch[1].trim();
  const body = bodyMatch[1].trim();

  return { title, body };
};

export const convertPDFToText = async (fileUri: string): Promise<string> => {
  const file = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (!file || !file.assets || file.assets.length === 0) {
    throw new Error('Could not read PDF file');
  }

  const pdfFile = await pdfjsLib.getDocument(file.assets[0].uri).promise;
  const text = await pdfFile.getTextContent().then((textContent) => {
    const textItems = textContent.items;
    const textString = textItems.map((item) => item.str).join('');
    return textString;
  });

  return text;
};
