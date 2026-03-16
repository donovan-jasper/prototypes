import * as tf from '@tensorflow/tfjs';
import { bundleResourceIO } from '@tensorflow/tfjs-react-native';

export class ModelLoader {
  private models: { [key: string]: tf.LayersModel } = {};

  async loadModel(modelName: string): Promise<tf.LayersModel> {
    if (this.models[modelName]) {
      return this.models[modelName];
    }

    // Load model from assets
    const modelJson = require(`@/assets/models/${modelName}/model.json`);
    const modelWeights = require(`@/assets/models/${modelName}/group1-shard1of1.bin`);

    const model = await tf.loadLayersModel(bundleResourceIO(modelJson, modelWeights));
    this.models[modelName] = model;

    return model;
  }

  async warmUpModel(modelName: string): Promise<void> {
    const model = await this.loadModel(modelName);
    // Run a dummy inference to warm up the model
    const dummyInput = tf.zeros([1, ...model.inputs[0].shape.slice(1)]);
    await model.predict(dummyInput).data();
    tf.dispose(dummyInput);
  }
}
