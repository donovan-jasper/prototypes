import { extractWithLLM } from '../api/llm';
import { extractTextFromImage } from '../api/ocr';
import { transcribeAudio } from '../api/audio';

interface ExtractionInput {
  text?: string;
  audio?: string;
  image?: string;
}

interface ExtractionResult {
  entities: Array<{ type: string; value: string }>;
  summary?: string;
}

export const extractData = async (input: ExtractionInput): Promise<ExtractionResult> => {
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

    return await extractWithLLM(textToProcess);
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
};
