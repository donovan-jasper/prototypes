import { Attribution, Generation } from '../types';

export const generateAttribution = (params: {
  model: string;
  prompt: string;
  timestamp?: Date;
}): Attribution => {
  return {
    model: params.model,
    prompt: params.prompt,
    timestamp: params.timestamp ? params.timestamp.toISOString() : new Date().toISOString(),
    attributionId: `attribution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
};

export const validateAttribution = (attribution: Attribution): boolean => {
  return !!(attribution.model && attribution.prompt && attribution.timestamp && attribution.attributionId);
};

export const formatAttributionText = (attribution: Attribution): string => {
  return `Generated with ${attribution.model} on ${new Date(attribution.timestamp).toLocaleDateString()}`;
};

export const embedAttributionInImage = async (imageUri: string, attribution: Attribution): Promise<string> => {
  // In a real implementation, this would embed the attribution in the image metadata
  // For now, we'll just return the original URI
  return imageUri;
};
