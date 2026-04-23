interface Review {
  id: string;
  source: string;
  score: number;
  text: string;
  publicationDate: string;
  publication: string;
}

// Publication weights (higher weight = more influential)
const publicationWeights: Record<string, number> = {
  'Pitchfork': 1.5,
  'Rolling Stone': 1.2,
  'NME': 1.0,
  'The Guardian': 1.0,
  'Spin': 0.9,
  'Q Magazine': 0.8,
  'Clash': 0.7,
  'Under the Radar': 0.6,
  'Exclaim!': 0.5,
  'PopMatters': 0.5,
  'Stereogum': 0.4,
  'Consequence of Sound': 0.4,
  'AllMusic': 0.3,
  'The A.V. Club': 0.3,
  'The Line of Best Fit': 0.2,
  'Drowned in Sound': 0.2,
  'Tiny Mix Tapes': 0.2,
  'Pitchfork (Staff Review)': 1.6,
  'Rolling Stone (Staff Review)': 1.3,
  'NME (Staff Review)': 1.1
};

export const calculateConsensusScore = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;

  // Calculate weighted average
  let totalWeightedScore = 0;
  let totalWeight = 0;

  reviews.forEach(review => {
    const weight = publicationWeights[review.publication] || 0.5; // Default weight if not found
    totalWeightedScore += review.score * weight;
    totalWeight += weight;
  });

  const weightedAverage = totalWeightedScore / totalWeight;

  // Normalize to 0-100 scale (assuming original scores are 0-10)
  const normalizedScore = Math.round((weightedAverage / 10) * 100);

  // Ensure score is between 0-100
  return Math.min(100, Math.max(0, normalizedScore));
};
