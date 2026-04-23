import { ModelLoader } from './modelLoader';

export class TextProcessor {
  private modelLoader: ModelLoader;
  private model: any;

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader;
  }

  async loadModel(): Promise<void> {
    try {
      this.model = await this.modelLoader.loadModel('text-processor');
      console.log('TextProcessor: Model loaded successfully.');
    } catch (error) {
      console.error('TextProcessor: Failed to load model:', error);
      throw error; 
    }
  }

  async ocr(imageUri: string): Promise<string> {
    if (!this.model) {
      throw new Error('Text processor model not loaded. Call loadModel() first.');
    }
    console.log(`TextProcessor: Performing OCR on ${imageUri}...`);
    await new Promise(resolve => setTimeout(resolve, 300));
    return 'This is simulated OCR text from an image.';
  }

  async summarize(text: string): Promise<string> {
    if (!this.model) {
      throw new Error('Text processor model not loaded. Call loadModel() first.');
    }
    console.log(`TextProcessor: Summarizing text...`);
    await new Promise(resolve => setTimeout(resolve, 100));
    return text.substring(0, Math.min(text.length, 50)) + '... (summary)';
  }

  async extractEntities(text: string): Promise<any[]> {
    if (!this.model) {
      throw new Error('Text processor model not loaded. Call loadModel() first.');
    }
    console.log(`TextProcessor: Extracting entities...`);
    await new Promise(resolve => setTimeout(resolve, 150));
    return [{ type: 'DATE', value: '2023-10-26' }];
  }
}
