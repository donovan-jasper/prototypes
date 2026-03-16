import * as tf from '@tensorflow/tfjs';
import { getBehaviorVector } from '../database/queries';

export const findMatches = async (userId, potentialMatches) => {
  const userVector = await getBehaviorVector(userId);
  const userTensor = tf.tensor1d(userVector.vector_data);

  const matches = [];

  for (const potentialMatch of potentialMatches) {
    const matchVector = await getBehaviorVector(potentialMatch.id);
    const matchTensor = tf.tensor1d(matchVector.vector_data);

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

  const cosineSimilarity = dotProduct.div(userNorm.mul(matchNorm));

  // Convert cosine similarity to a compatibility score (0-100)
  const compatibilityScore = cosineSimilarity.mul(100).dataSync()[0];

  return Math.max(0, Math.min(100, compatibilityScore)); // Ensure score is between 0 and 100
};

export const generateCompatibilityInsights = (userVector, matchVector) => {
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
