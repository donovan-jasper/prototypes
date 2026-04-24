import { Attribution, Generation, Artist } from '../types';
import { getArtists } from './database';

export const generateAttribution = async (params: {
  model: string;
  prompt: string;
  timestamp?: Date;
}): Promise<Attribution> => {
  // Detect credited artists based on prompt
  const artists = await getArtists();
  const creditedArtists = detectStyleMatches(params.prompt, artists);

  return {
    model: params.model,
    prompt: params.prompt,
    timestamp: params.timestamp ? params.timestamp.toISOString() : new Date().toISOString(),
    attributionId: `attribution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    styleInfluences: creditedArtists.map(artist => artist.style),
    trainingDataSources: ['OpenAI training data']
  };
};

export const validateAttribution = (attribution: Attribution): boolean => {
  return !!(attribution.model && attribution.prompt && attribution.timestamp && attribution.attributionId);
};

export const formatAttributionText = (attribution: Attribution): string => {
  let text = `Generated with ${attribution.model} on ${new Date(attribution.timestamp).toLocaleDateString()}`;

  if (attribution.styleInfluences && attribution.styleInfluences.length > 0) {
    text += `\nStyle influences: ${attribution.styleInfluences.join(', ')}`;
  }

  if (attribution.trainingDataSources && attribution.trainingDataSources.length > 0) {
    text += `\nTraining data sources: ${attribution.trainingDataSources.join(', ')}`;
  }

  return text;
};

export const embedAttributionInImage = async (imageUri: string, attribution: Attribution): Promise<string> => {
  // In a real implementation, this would embed the attribution in the image metadata
  // For now, we'll just return the original URI
  return imageUri;
};

// Helper function to detect style matches between prompt and registered artists
const detectStyleMatches = (prompt: string, artists: Artist[]): Artist[] => {
  const promptLower = prompt.toLowerCase();
  const matches: Artist[] = [];

  for (const artist of artists) {
    // Check if artist's style appears in the prompt
    if (promptLower.includes(artist.style.toLowerCase())) {
      matches.push(artist);
    }

    // Additional checks for style keywords
    const styleKeywords = artist.style.toLowerCase().split(/[ ,]+/);
    for (const keyword of styleKeywords) {
      if (promptLower.includes(keyword)) {
        if (!matches.includes(artist)) {
          matches.push(artist);
        }
        break;
      }
    }
  }

  return matches;
};

// New function to get credited artists from a prompt
export const getCreditedArtists = async (prompt: string): Promise<Artist[]> => {
  const artists = await getArtists();
  return detectStyleMatches(prompt, artists);
};

// New function to format attribution for sharing
export const formatShareAttribution = (attribution: Attribution): string => {
  let text = `Created with CrediGen using ${attribution.model}\n\n`;

  if (attribution.styleInfluences && attribution.styleInfluences.length > 0) {
    text += `Style influences: ${attribution.styleInfluences.join(', ')}\n\n`;
  }

  text += `Prompt: ${attribution.prompt}\n\n`;
  text += `Generated on ${new Date(attribution.timestamp).toLocaleDateString()}`;

  return text;
};
