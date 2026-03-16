export const analyzeSentiment = (headline: string) => {
  const positiveWords = ['bullish', 'up', 'rise', 'gain', 'positive', 'strong'];
  const negativeWords = ['bearish', 'down', 'fall', 'loss', 'negative', 'weak'];

  const words = headline.toLowerCase().split(/\s+/);
  let score = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) {
      score += 1;
    } else if (negativeWords.includes(word)) {
      score -= 1;
    }
  });

  return score / words.length;
};
