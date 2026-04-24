import { extractWithLLM } from '../api/llm';

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

    return await extractWithLLM(textToProcess);
  } catch (error) {
    console.error('Extraction error:', error);
    throw error;
  }
};
