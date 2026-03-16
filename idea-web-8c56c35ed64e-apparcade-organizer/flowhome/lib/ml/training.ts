import { trainModel } from './predictor';
import { detectPatterns } from './patterns';

export const runTraining = async () => {
  await trainModel();
  await detectPatterns();
};
