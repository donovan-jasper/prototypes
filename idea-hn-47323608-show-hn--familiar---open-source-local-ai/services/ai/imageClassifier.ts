import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native'; 
import * as FileSystem from 'expo-file-system';
import { ModelLoader } from './modelLoader';

const IMAGE_SIZE = 224;
const TOP_K_PREDICTIONS = 3;

const NIGHTOWL_CATEGORIES = [
  'receipt', 'screenshot', 'person', 'landscape', 'document', 'food', 'animal', 'vehicle', 'building', 'text', 'other'
];

export class ImageClassifier {
  private modelLoader: ModelLoader;
  private model: tf.GraphModel | tf.LayersModel | null = null;

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader;
  }

  async loadModel(): Promise<void> {
    try {
      await tf.ready();
      this.model = await this.modelLoader.loadModel('image-classifier');
      console.log('ImageClassifier: Model loaded successfully.');
    } catch (error) {
      console.error('ImageClassifier: Failed to load model:', error);
      throw error; 
    }
  }

  async classify(imageUri: string): Promise<string[]> {
    if (!this.model) {
      throw new Error('Image classifier model not loaded. Call loadModel() first.');
    }
    console.log(`ImageClassifier: Classifying image ${imageUri}...`);

    let rawImgTensor: tf.Tensor3D | null = null;
    let resizedImg: tf.Tensor3D | null = null;
    let normalizedImg: tf.Tensor3D | null = null;
    let inputTensor: tf.Tensor4D | null = null;
    let predictions: tf.Tensor | null = null;
    let probabilities: tf.Tensor | null = null;
    let topK: { values: tf.Tensor1D; indices: tf.Tensor1D } | null = null;

    try {
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;

      rawImgTensor = tf.decodeImage(imgBuffer);

      if (rawImgTensor.shape[2] === 4) { 
        rawImgTensor = rawImgTensor.slice([0, 0, 0], [rawImgTensor.shape[0], rawImgTensor.shape[1], 3]);
      } else if (rawImgTensor.shape[2] === 1) { 
        rawImgTensor = rawImgTensor.tile([1, 1, 3]); 
      }

      resizedImg = tf.image.resizeBilinear(rawImgTensor, [IMAGE_SIZE, IMAGE_SIZE]);

      normalizedImg = resizedImg.toFloat().div(127.5).sub(1);

      inputTensor = normalizedImg.expandDims(0);

      predictions = this.model.predict(inputTensor) as tf.Tensor;

      probabilities = tf.softmax(predictions);
      topK = await probabilities.topk(TOP_K_PREDICTIONS);

      const topKIndices = topK.indices.dataSync();
      const classifiedLabels: string[] = [];
      for (let i = 0; i < TOP_K_PREDICTIONS; i++) {
        const predictedCategoryIndex = topKIndices[i] % NIGHTOWL_CATEGORIES.length;
        classifiedLabels.push(NIGHTOWL_CATEGORIES[predictedCategoryIndex]);
      }

      console.log(`ImageClassifier: Classified image ${imageUri} as:`, classifiedLabels);
      return classifiedLabels;

    } catch (error) {
      console.error(`ImageClassifier: Error classifying image ${imageUri}:`, error);
      throw new Error(`Failed to classify image ${imageUri}`);
    }
  }
}
