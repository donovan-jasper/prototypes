export interface TrustFactors {
  biometricSuccess: boolean;
  movementEntropy: number;
  deviceReputation: number;
  verificationHistory: number;
}

export function calculateTrustScore(factors: TrustFactors): number {
  let score = 0;
  
  if (factors.biometricSuccess) score += 40;
  
  score += factors.movementEntropy * 30;
  
  score += factors.deviceReputation * 20;
  
  const historyBonus = Math.min(factors.verificationHistory / 10, 1) * 10;
  score += historyBonus;
  
  return Math.round(Math.max(0, Math.min(100, score)));
}

export function calculatePassiveTrustScore(
  movementEntropy: number,
  deviceReputation: number,
  verificationHistory: number
): number {
  let score = 0;
  
  // Passive monitoring gets lower weight (no biometric verification)
  score += movementEntropy * 20; // Reduced from 30
  
  score += deviceReputation * 15; // Reduced from 20
  
  const historyBonus = Math.min(verificationHistory / 10, 1) * 10;
  score += historyBonus;
  
  // Cap passive score at 65 (requires full verification to reach higher)
  return Math.round(Math.max(0, Math.min(65, score)));
}

export async function updateTrustScore(
  currentScore: number,
  newFactors: TrustFactors
): Promise<number> {
  const newScore = calculateTrustScore(newFactors);
  return Math.round((currentScore * 0.7) + (newScore * 0.3));
}
