import { useState } from 'react';
import { extractWithLLM } from '../api/llm';
import { extractTextFromImage } from '../api/ocr';
import { transcribeAudio } from '../api/audio';

interface ExtractionResult {
  entities: Array<{ type: string; value: string }>;
  summary?: string;
  error?: string;
}

export const useExtraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const extractData = async (input: { text?: string; audio?: string; image?: string }) => {
    setIsLoading(true);
    setResult(null);

    try {
      let textToProcess = '';

      if (input.text) {
        textToProcess = input.text;
      } else if (input.audio) {
        // Transcribe audio using the actual audio service
        textToProcess = await transcribeAudio(input.audio);
      } else if (input.image) {
        // Extract text from image using OCR service
        textToProcess = await extractTextFromImage(input.image);
      }

      if (!textToProcess) {
        throw new Error('No valid input provided');
      }

      const llmResult = await extractWithLLM(textToProcess);
      setResult(llmResult);
    } catch (error) {
      console.error('Extraction error:', error);
      setResult({
        entities: [],
        error: error instanceof Error ? error.message : 'Failed to process data'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return { extractData, isLoading, result };
};
