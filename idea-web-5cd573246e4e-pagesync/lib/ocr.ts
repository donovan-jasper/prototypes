import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

export const initOCR = async () => {
  if (!worker) {
    worker = await createWorker('eng');
  }
};

export const extractPageNumber = (text: string): number | null => {
  // Enhanced pattern matching for page numbers
  const patterns = [
    /page\s+(\d+)/i,
    /p\.\s*(\d+)/i,
    /^(\d+)$/m,
    /\[(\d+)\]/,
    /\b(\d+)\b/,
    /(\d+)\s*of\s*\d+/i, // For "X of Y" patterns
    /(\d+)\s*\/\s*\d+/   // For "X/Y" patterns
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > 0 && num < 10000) return num;
    }
  }

  return null;
};

export const extractBookInfo = (text: string) => {
  // Extract title from first line (common in headers)
  const lines = text.split('\n').filter(l => l.trim());
  const title = lines[0]?.trim() || null;

  // Look for ISBN pattern
  const isbnMatch = text.match(/ISBN[:\s-]*(\d{10}|\d{13})/i);
  const isbn = isbnMatch ? isbnMatch[1] : null;

  // Look for author pattern (common in headers)
  const authorMatch = text.match(/by\s+([^\n]+)/i);
  const author = authorMatch ? authorMatch[1].trim() : null;

  // Look for total pages pattern
  const pagesMatch = text.match(/(\d+)\s+pages?/i);
  const totalPages = pagesMatch ? parseInt(pagesMatch[1], 10) : undefined;

  return { title, isbn, author, totalPages };
};

export const scanPage = async (imageUri: string) => {
  await initOCR();
  if (!worker) throw new Error('OCR not initialized');

  const { data: { text } } = await worker.recognize(imageUri);
  const pageNumber = extractPageNumber(text);
  const bookInfo = extractBookInfo(text);

  return { pageNumber, bookInfo, rawText: text };
};

export const cleanupOCR = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
};
