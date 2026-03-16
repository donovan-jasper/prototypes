import { Generation } from '../types';

export const calculateEthicalScore = (generations: Generation[]): number => {
  if (generations.length === 0) return 0;

  // Calculate average score based on attribution completeness
  const totalScore = generations.reduce((sum, gen) => {
    // Base score: 50 points for having attribution
    let score = 50;
    
    // Bonus points for complete attribution
    if (gen.attribution.model && gen.attribution.timestamp && gen.attribution.attributionId) {
      score += 30;
    }
    
    // Bonus points for sharing with attribution
    // In a real implementation, we'd track if the generation was shared
    score += 20;
    
    return sum + score;
  }, 0);

  return Math.min(100, Math.floor(totalScore / generations.length));
};

export const updateScore = (currentScore: number, action: { hasFullAttribution: boolean; shared: boolean }): number => {
  let newScore = currentScore;
  
  if (action.hasFullAttribution) {
    newScore += 5; // Small boost for proper attribution
  }
  
  if (action.shared) {
    newScore += 3; // Small boost for sharing with attribution
  }
  
  return Math.min(100, newScore);
};

export const getScoreLevel = (score: number): string => {
  if (score >= 80) return 'Exemplary';
  if (score >= 60) return 'Ethical';
  if (score >= 40) return 'Improving';
  return 'Beginner';
};
