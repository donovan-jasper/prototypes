import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import { getAppUsage } from '../database';

let model: tf.LayersModel | null = null;

export const initModel = async () => {
  await tf.ready();
  model = tf.sequential();
  model.add(tf.layers.dense({ units: 10, inputShape: [3], activation: 'relu' }));
  model.add(tf.layers.dense({ units: 8, activation: 'softmax' }));
  model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy' });
};

export const trainModel = async () => {
  if (!model) {
    await initModel();
  }

  getAppUsage(async (usage) => {
    const inputs: number[][] = [];
    const outputs: number[][] = [];

    usage.forEach((item) => {
      const hour = new Date(item.timestamp).getHours();
      const dayOfWeek = new Date(item.timestamp).getDay();
      const locationId = item.context_location === 'home' ? 0 : item.context_location === 'work' ? 1 : 2;

      inputs.push([hour, dayOfWeek, locationId]);
      outputs.push([usage.filter(u => u.package_name === item.package_name).length]);
    });

    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);

    await model?.fit(xs, ys, { epochs: 10 });
  });
};

export const predictApps = async (hour: number, dayOfWeek: number, locationId: number) => {
  if (!model) {
    await initModel();
  }

  const input = tf.tensor2d([[hour, dayOfWeek, locationId]]);
  const prediction = model?.predict(input) as tf.Tensor;
  const probabilities = await prediction.data();

  return probabilities;
};
