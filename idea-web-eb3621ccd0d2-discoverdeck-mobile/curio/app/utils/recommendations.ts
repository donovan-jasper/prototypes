import { mockApps, MockApp } from '../data/mockApps';

interface SearchResult {
  app: MockApp;
  score: number;
}

const tokenize = (text: string): string[] => {
  return text.toLowerCase().split(/\s+/).filter(token => token.length > 0);
};

const calculateFuzzyScore = (query: string, target: string): number => {
  const queryLower = query.toLowerCase();
  const targetLower = target.toLowerCase();
  
  if (targetLower === queryLower) return 100;
  if (targetLower.includes(queryLower)) return 80;
  
  let score = 0;
  const queryTokens = tokenize(query);
  const targetTokens = tokenize(target);
  
  for (const qToken of queryTokens) {
    for (const tToken of targetTokens) {
      if (tToken === qToken) {
        score += 50;
      } else if (tToken.includes(qToken) || qToken.includes(tToken)) {
        score += 30;
      } else if (levenshteinDistance(qToken, tToken) <= 2) {
        score += 20;
      }
    }
  }
  
  return score;
};

const levenshteinDistance = (a: string, b: string): number => {
  const matrix: number[][] = [];
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[b.length][a.length];
};

const calculateRelevanceScore = (query: string, app: MockApp): number => {
  let totalScore = 0;
  
  totalScore += calculateFuzzyScore(query, app.name) * 3;
  totalScore += calculateFuzzyScore(query, app.description) * 2;
  totalScore += calculateFuzzyScore(query, app.category) * 2;
  
  for (const tag of app.tags) {
    totalScore += calculateFuzzyScore(query, tag) * 1.5;
  }
  
  for (const useCase of app.useCases) {
    totalScore += calculateFuzzyScore(query, useCase) * 2;
  }
  
  totalScore += app.rating * 5;
  
  return totalScore;
};

export const getRecommendations = async (queryText: string): Promise<MockApp[]> => {
  if (!queryText || queryText.trim().length === 0) {
    return mockApps.slice(0, 10);
  }
  
  const results: SearchResult[] = mockApps.map(app => ({
    app,
    score: calculateRelevanceScore(queryText, app)
  }));
  
  results.sort((a, b) => b.score - a.score);
  
  const topResults = results
    .filter(result => result.score > 0)
    .slice(0, 10)
    .map(result => result.app);
  
  return topResults.length > 0 ? topResults : mockApps.slice(0, 10);
};
