import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';

const loadModel = async () => {
  const model = await tf.loadLayersModel('path/to/model.json');
  return model;
};

const predict = async (model, input) => {
  const tensor = tf.tensor2d([input]);
  const prediction = model.predict(tensor);
  return prediction.dataSync();
};

export { loadModel, predict };
