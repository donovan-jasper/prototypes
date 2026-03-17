import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;

export const initOCR = async () => {
  if (!worker) {
    worker = await createWorker('eng');
  }
};

export const extractPageNumber = (text: string): number | null => {
  const patterns = [
    /page\s+(\d+)/i,
    /p\.\s*(\d+)/i,
    /^(\d+)$/m,
    /\[(\d+)\]/,
    /\b(\d+)\b/
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
  const lines = text.split('\n').filter(l => l.trim());
  const title = lines[0]?.trim() || null;
  
  const isbnMatch = text.match(/ISBN[:\s-]*(\d{10}|\d{13})/i);
  const isbn = isbnMatch ? isbnMatch[1] : null;
  
  return { title, isbn };
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
