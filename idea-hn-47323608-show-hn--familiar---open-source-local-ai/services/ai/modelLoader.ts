import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native'; // Important for backend setup
import { bundleResourceIO } from '@tensorflow/tfjs-react-native/dist/bundle_resource_io';

/**
 * IMPORTANT:
 * To make this code fully functional, you need to download a pre-trained TensorFlow Lite
 * (or TF.js compatible) model and place its files in the `assets/models/` directory.
 *
 * For example, for MobileNetV2:
 * 1. Download the TF.js MobileNetV2 model from TensorFlow Hub or a similar source.
 *    A common one is: https://tfhub.dev/tensorflow/tfjs-model/imagenet/mobilenet_v2_100_224/classification/3/default/1
 *    (Note: This link provides a TF.js model, not TFLite. For TFLite, you'd typically convert it first,
 *    but tfjs-react-native can load TF.js models directly.)
 * 2. Extract the contents (model.json and group1-shardXofY.bin files) into:
 *    `nightowl-ai/assets/models/mobilenet_v2/`
 *
 * Ensure your `assets/models/mobilenet_v2` directory contains:
 * - `model.json`
 * - `group1-shard1of1.bin` (or multiple shard files if the model is split)
 */

// Define the paths to your bundled model files.
// These `require` statements tell Metro bundler to include these files in the app bundle.
const MODEL_JSON_PATH = require('../../assets/models/mobilenet_v2/model.json');
const MODEL_WEIGHTS_PATH = [
  require('../../assets/models/mobilenet_v2/group1-shard1of1.bin'),
  // If your model has multiple weight shards, list them here:
  // require('../../assets/models/mobilenet_v2/group1-shard2ofX.bin'),
  // ...
];

export class ModelLoader {
  private _modelCache: { [key: string]: tf.GraphModel | tf.LayersModel } = {};

  /**
   * Loads a TensorFlow.js model from the app's bundled assets.
   * Caches the loaded model to prevent redundant loading.
   * @param modelName A logical name for the model (e.g., 'image-classifier').
   * @returns The loaded TensorFlow.js model.
   */
  async loadModel(modelName: string): Promise<tf.GraphModel | tf.LayersModel> {
    if (this._modelCache[modelName]) {
      console.log(`ModelLoader: Model ${modelName} retrieved from cache.`);
      return this._modelCache[modelName];
    }

    console.log(`ModelLoader: Loading model ${modelName} from assets...`);
    try {
      // Ensure the TF.js backend is ready before loading the model.
      await tf.ready();

      // Use bundleResourceIO to load models bundled with the Expo app.
      // This assumes 'model.json' and its corresponding '.bin' weight files are
      // correctly placed in the specified assets directory.
      const model = await tf.loadGraphModel(bundleResourceIO(MODEL_JSON_PATH, MODEL_WEIGHTS_PATH));
      this._modelCache[modelName] = model;
      console.log(`ModelLoader: Model ${modelName} loaded successfully.`);
      return model;
    } catch (error) {
      console.error(`ModelLoader: Failed to load model ${modelName}:`, error);
      throw new Error(`Failed to load AI model: ${modelName}. Ensure model files are correctly placed in assets/models/mobilenet_v2/ and are valid TF.js models. Error: ${error.message}`);
    }
  }
}
