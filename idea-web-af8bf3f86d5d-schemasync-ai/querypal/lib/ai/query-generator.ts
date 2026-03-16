import { callOpenAI } from './openai-client';
import { getQueryGenerationPrompt } from './prompts';

export const generateSQLFromNaturalLanguage = async (naturalLanguageQuery: string, schema: any) => {
  const prompt = getQueryGenerationPrompt(schema, naturalLanguageQuery);
  const response = await callOpenAI([prompt]);

  // Extract SQL query from response
  const sqlMatch = response.match(/SQL query: (.+)/);
  if (!sqlMatch) {
    throw new Error('Failed to generate SQL query');
  }

  const sqlQuery = sqlMatch[1].trim();

  // Validate the generated SQL
  if (!isSafeQuery(sqlQuery)) {
    throw new Error('Generated query contains unsafe operations');
  }

  return sqlQuery;
};

const isSafeQuery = (sql: string) => {
  // Basic safety check - only allow SELECT queries
  const forbiddenKeywords = ['DELETE', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE'];
  return !forbiddenKeywords.some(keyword =>
    sql.toUpperCase().includes(keyword)
  );
};
