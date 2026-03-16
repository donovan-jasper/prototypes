import * as tf from '@tensorflow/tfjs';
import { ModelLoader } from './modelLoader';

export class ImageClassifier {
  private modelLoader: ModelLoader;
  private model: tf.LayersModel | null = null;
  private labels: string[] = [];

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader;
  }

  async loadModel(): Promise<void> {
    this.model = await this.modelLoader.loadModel('mobilenet');
    // Load labels from file
    const labels = require('@/assets/models/mobilenet/labels.json');
    this.labels = labels;
  }

  async classifyImage(imageUri: string): Promise<{ label: string; confidence: number }[]> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }

    // Load and preprocess image
    const imageTensor = await this.preprocessImage(imageUri);

    // Run inference
    const predictions = this.model.predict(imageTensor) as tf.Tensor;
    const scores = await predictions.data();

    // Get top predictions
    const topPredictions = this.getTopPredictions(scores);

    tf.dispose([imageTensor, predictions]);

    return topPredictions;
  }

  private async preprocessImage(imageUri: string): Promise<tf.Tensor> {
    // Implement image loading and preprocessing
    // This is a simplified version - actual implementation would use expo-image-manipulator
    // to resize and normalize the image
    return tf.zeros([1, 224, 224, 3]);
  }

  private getTopPredictions(scores: Float32Array, topK = 3): { label: string; confidence: number }[] {
    const topIndices = this.getTopKIndices(scores, topK);
    return topIndices.map(index => ({
      label: this.labels[index],
      confidence: scores[index],
    }));
  }

  private getTopKIndices(scores: Float32Array, k: number): number[] {
    const indices = Array.from(scores.keys());
    indices.sort((a, b) => scores[b] - scores[a]);
    return indices.slice(0, k);
  }
}
