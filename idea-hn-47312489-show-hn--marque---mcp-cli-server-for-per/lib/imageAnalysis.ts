import { analyzeImage } from './ai';

export const extractColors = async (imageUri) => {
  const analysis = await analyzeImage(imageUri);
  return analysis.colors;
};

export const analyzeTypography = async (imageUri) => {
  const analysis = await analyzeImage(imageUri);
  return analysis.typography;
};
