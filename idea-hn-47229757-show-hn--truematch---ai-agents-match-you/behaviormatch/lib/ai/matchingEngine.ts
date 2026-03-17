import * as tf from '@tensorflow/tfjs';
import { getRemoteBehaviorVector } from '../supabase'; // Import from Supabase

export const findMatches = async (userId: string, potentialMatches: any[]) => {
  // Fetch the current user's behavior vector from Supabase
  const userVectorData = await getRemoteBehaviorVector(userId);

  if (!userVectorData) {
    console.warn(`No remote behavior vector found for current user ${userId}. Cannot find matches.`);
    return []; // Return empty array if current user's vector is missing
  }

  const userTensor = tf.tensor1d(userVectorData);

  const matches = [];

  for (const potentialMatch of potentialMatches) {
    // Fetch each potential match's behavior vector from Supabase
    const matchVectorData = await getRemoteBehaviorVector(potentialMatch.id);

    if (!matchVectorData) {
      console.warn(`No remote behavior vector found for potential match ${potentialMatch.id}. Skipping.`);
      continue; // Skip this potential match if their vector is missing
    }

    const matchTensor = tf.tensor1d(matchVectorData);

    const compatibilityScore = calculateCompatibilityScore(userTensor, matchTensor);

    matches.push({
      ...potentialMatch,
      compatibilityScore,
    });
  }

  // Sort matches by compatibility score in descending order
  matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return matches;
};

const calculateCompatibilityScore = (userTensor, matchTensor) => {
  // Calculate cosine similarity between the two vectors
  const dotProduct = tf.sum(tf.mul(userTensor, matchTensor));
  const userNorm = tf.norm(userTensor);
  const matchNorm = tf.norm(matchTensor);

  // Handle division by zero if a norm is zero (e.g., all zeros vector)
  if (userNorm.dataSync()[0] === 0 || matchNorm.dataSync()[0] === 0) {
    return 0; // No similarity if one vector is zero
  }

  const cosineSimilarity = dotProduct.div(userNorm.mul(matchNorm));

  // Convert cosine similarity to a compatibility score (0-100)
  // Cosine similarity ranges from -1 to 1. Map it to 0-100.
  // (similarity + 1) / 2 * 100
  const compatibilityScore = cosineSimilarity.add(1).div(2).mul(100).dataSync()[0];

  return Math.max(0, Math.min(100, compatibilityScore)); // Ensure score is between 0 and 100
};

export const generateCompatibilityInsights = (userVector: number[], matchVector: number[]) => {
  // Implement logic to generate compatibility insights
  // This could analyze specific dimensions of the behavior vectors
  // to provide meaningful explanations for the compatibility score

  // For demonstration, we'll return some placeholder insights
  return [
    {
      title: 'Communication Style',
      description: 'You both prefer deep conversations over small talk',
      icon: 'chatbubbles',
      details: 'Based on your message patterns and response times',
    },
    {
      title: 'Energy Levels',
      description: 'You both maintain consistent engagement throughout conversations',
      icon: 'flash',
      details: 'Based on your session durations and interaction frequencies',
    },
    {
      title: 'Interaction Preferences',
      description: 'You both enjoy exploring new topics together',
      icon: 'compass',
      details: 'Based on your swipe patterns and conversation depth',
    },
  ];
};
