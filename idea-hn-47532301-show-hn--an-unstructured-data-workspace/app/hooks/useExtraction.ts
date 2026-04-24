import { useState } from 'react';
import { extractWithLLM } from '../../api/llm';
import { transcribeAudio } from '../../api/ocr';
import { extractTextFromImage } from '../../api/ocr';

interface ExtractionParams {
  text?: string;
  audio?: string;
  image?: string;
}

interface Entity {
  type: string;
  value: string;
}

interface ExtractionResult {
  entities?: Entity[];
  summary?: string;
  error?: string;
}

export const useExtraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  const extractData = async ({ text, audio, image }: ExtractionParams): Promise<ExtractionResult> => {
    setIsLoading(true);
    setResult(null);

    try {
      let extractionText = '';

      if (text) {
        extractionText = text;
      } else if (audio) {
        // Transcribe audio using OCR API
        const transcription = await transcribeAudio(audio);
        extractionText = transcription.text;
      } else if (image) {
        // Extract text from image using OCR API
        const imageText = await extractTextFromImage(image);
        extractionText = imageText.text;
      }

      if (!extractionText) {
        throw new Error('No valid input provided for extraction');
      }

      const llmResult = await extractWithLLM(extractionText);
      const extractionResult: ExtractionResult = {
        entities: llmResult.entities,
        summary: llmResult.summary,
      };

      setResult(extractionResult);
      return extractionResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to extract data';
      const errorResult: ExtractionResult = { error: errorMessage };
      setResult(errorResult);
      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return { extractData, isLoading, result };
};
