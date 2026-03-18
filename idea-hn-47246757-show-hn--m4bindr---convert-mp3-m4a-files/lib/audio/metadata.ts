import { extractAudioDuration } from './processor';

export const extractMetadata = async (filePath: string) => {
  const duration = await extractAudioDuration(filePath);
  
  // Extract filename without extension as title
  const fileName = filePath.split('/').pop() || 'Unknown';
  const title = fileName.replace(/\.[^/.]+$/, '');
  
  return {
    title,
    author: 'Unknown Author',
    duration,
    coverArt: null,
  };
};
