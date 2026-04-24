import { useState } from 'react';
import { extractWithLLM } from '../api/llm';

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
        // In a real implementation, you would transcribe the audio here
        // For this example, we'll use a mock transcription
        textToProcess = "Sample transcribed text from audio: Meeting with John at 2:00 PM on 5/15/2023. Contact at john@example.com";
      } else if (input.image) {
        // In a real implementation, you would extract text from the image here
        // For this example, we'll use mock text
        textToProcess = "Sample text extracted from image: Invoice #12345 for $150.00 due 6/1/2023";
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
