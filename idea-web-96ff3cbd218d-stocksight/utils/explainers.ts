import { NewsArticle } from '../types/news';

export const explainLikeIm5 = async (article: NewsArticle): Promise<string> => {
  // Simple explanation generator
  const sentiment = article.sentiment > 0.5 ? 'good' :
                   article.sentiment < -0.5 ? 'bad' : 'neutral';

  const explanation = `This news is about ${article.symbol}. ` +
    `It says: "${article.title}". ` +
    `The news is ${sentiment} for ${article.symbol}. ` +
    `It means ${article.description || 'something happened'}. ` +
    `This could make ${article.symbol} go up or down.`;

  return explanation;
};
