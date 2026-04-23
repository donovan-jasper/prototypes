import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native'; // Important for backend setup
import * as FileSystem from 'expo-file-system';
import { ModelLoader } from './modelLoader';

// Model input dimensions for MobileNetV2
const IMAGE_SIZE = 224;
const TOP_K_PREDICTIONS = 3;

// Simplified NightOwl categories. In a real application, these would be
// either the direct output classes of a custom-trained model, or a mapping
// from a larger set of classes (like ImageNet) to these specific categories.
const NIGHTOWL_CATEGORIES = [
  'receipt', 'screenshot', 'person', 'landscape', 'document', 'food', 'animal', 'vehicle', 'building', 'text', 'other'
];

export class ImageClassifier {
  private modelLoader: ModelLoader;
  private model: tf.GraphModel | tf.LayersModel | null = null;

  constructor(modelLoader: ModelLoader) {
    this.modelLoader = modelLoader;
  }

  /**
   * Loads the image classification model using the ModelLoader.
   * Must be called before attempting to classify images.
   */
  async loadModel(): Promise<void> {
    try {
      // Ensure TF.js backend is ready before loading the model
      await tf.ready();
      this.model = await this.modelLoader.loadModel('image-classifier');
      console.log('ImageClassifier: Model loaded successfully.');
    } catch (error) {
      console.error('ImageClassifier: Failed to load model:', error);
      throw error; // Re-throw to indicate failure
    }
  }

  /**
   * Classifies an image from a given URI.
   * @param imageUri The URI of the image to classify (e.g., 'file:///path/to/image.jpg').
   * @returns A promise that resolves to an array of predicted classification labels.
   */
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
      // 1. Load image data from URI
      const imgB64 = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });
      // tf.decodeImage expects a Uint8Array or ArrayBuffer
      const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;

      // 2. Decode image into a 3D tensor (height, width, channels)
      rawImgTensor = tf.decodeImage(imgBuffer);

      // Ensure the image has 3 channels (RGB). Grayscale images might have 1.
      if (rawImgTensor.shape[2] === 4) { // RGBA
        rawImgTensor = rawImgTensor.slice([0, 0, 0], [rawImgTensor.shape[0], rawImgTensor.shape[1], 3]);
      } else if (rawImgTensor.shape[2] === 1) { // Grayscale
        rawImgTensor = rawImgTensor.tile([1, 1, 3]); // Convert to RGB by repeating channel
      }


      // 3. Resize image to model's expected input dimensions (e.g., 224x224)
      resizedImg = tf.image.resizeBilinear(rawImgTensor, [IMAGE_SIZE, IMAGE_SIZE]);

      // 4. Normalize pixel values. MobileNetV2 typically expects input in the [-1, 1] range.
      // (pixel_value / 127.5) - 1
      normalizedImg = resizedImg.toFloat().div(127.5).sub(1);

      // 5. Add a batch dimension (e.g., from [224, 224, 3] to [1, 224, 224, 3])
      inputTensor = normalizedImg.expandDims(0);

      // 6. Run inference
      predictions = this.model.predict(inputTensor) as tf.Tensor;

      // 7. Post-process the output: apply softmax, get top-k predictions, and map to labels
      probabilities = tf.softmax(predictions);
      topK = await probabilities.topk(TOP_K_PREDICTIONS);

      const topKIndices = topK.indices.dataSync();
      const topKValues = topK.values.dataSync(); // Optional: get confidence scores

      const classifiedLabels: string[] = [];
      for (let i = 0; i < TOP_K_PREDICTIONS; i++) {
        // In a real scenario, you would map topKIndices[i] to an ImageNet class name,
        // then potentially map that ImageNet class to a NightOwl category.
        // For this prototype, we'll just pick a category from NIGHTOWL_CATEGORIES
        // based on the index for demonstration purposes. This makes the output
        // somewhat deterministic for a given input, but not semantically accurate
        // without a proper ImageNet-to-NightOwl mapping.
        const predictedCategoryIndex = topKIndices[i] % NIGHTOWL_CATEGORIES.length;
        classifiedLabels.push(NIGHTOWL_CATEGORIES[predictedCategoryIndex]);
      }

      console.log(`ImageClassifier: Classified image ${imageUri} as:`, classifiedLabels);
      return classifiedLabels;

    } catch (error) {
      console.error(`ImageClassifier: Error classifying image ${imageUri}:`, error);
      throw new Error(`Failed to classify image: ${error.message}`);
    } finally {
      // Dispose of all tensors to prevent memory leaks
      rawImgTensor?.dispose();
      resizedImg?.dispose();
normalizedImg?.dispose();
      inputTensor?.dispose();
      predictions?.dispose();
      probabilities?.dispose();
      topK?.indices.dispose();
      topK?.values.dispose();
    }
  }
}
