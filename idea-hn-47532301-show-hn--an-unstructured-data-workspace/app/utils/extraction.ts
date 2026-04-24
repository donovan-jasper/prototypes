import { extractWithLLM } from '../../api/llm';
import { processImageWithOCR } from '../../api/ocr';

export const extractData = async (input: {
  text?: string;
  audio?: string;
  image?: string;
}): Promise<{ entities: Array<{ type: string; value: string }>; summary?: string }> => {
  try {
    if (input.image) {
      // Process image with OCR
      const ocrText = await processImageWithOCR(input.image);
      return await extractWithLLM(ocrText);
    } else if (input.text) {
      // Process text directly
      return await extractWithLLM(input.text);
    } else if (input.audio) {
      // In a real app, you would transcribe audio first
      // For now we'll simulate it with mock text
      const mockText = "This is a transcription of the recorded audio. The customer mentioned they need to schedule an appointment for December 15th at 2:30 PM.";
      return await extractWithLLM(mockText);
    }

    throw new Error('No valid input provided for extraction');
  } catch (error) {
    console.error('Extraction failed:', error);
    throw error;
  }
};
