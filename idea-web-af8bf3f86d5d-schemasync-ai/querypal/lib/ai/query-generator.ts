import { callOpenAI } from './openai-client';
import { getQueryGenerationPrompt } from './prompts';

export const generateSQLFromNaturalLanguage = async (naturalLanguageQuery: string, schema: any) => {
  if (!naturalLanguageQuery.trim()) {
    throw new Error('Query cannot be empty');
  }

  const prompt = getQueryGenerationPrompt(schema, naturalLanguageQuery);
  const response = await callOpenAI([
    {
      role: 'system',
      content: 'You are a SQL expert. Generate ONLY safe SELECT queries. Return the SQL query on a line starting with "SQL:" and a brief explanation on a line starting with "Explanation:"',
    },
    prompt,
  ]);

  // Extract SQL query from response
  const lines = response.split('\n');
  const sqlLine = lines.find(line => line.trim().startsWith('SQL:'));
  
  if (!sqlLine) {
    throw new Error('Failed to generate SQL query from AI response');
  }

  const sqlQuery = sqlLine.replace(/^SQL:\s*/i, '').trim();

  // Validate the generated SQL
  if (!isSafeQuery(sqlQuery)) {
    throw new Error('Generated query contains unsafe operations. Only SELECT queries are allowed.');
  }

  return sqlQuery;
};

const isSafeQuery = (sql: string): boolean => {
  const upperSQL = sql.toUpperCase().trim();
  
  // Must start with SELECT
  if (!upperSQL.startsWith('SELECT')) {
    return false;
  }

  // Check for forbidden keywords
  const forbiddenKeywords = ['DELETE', 'DROP', 'TRUNCATE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'GRANT', 'REVOKE'];
  
  for (const keyword of forbiddenKeywords) {
    if (upperSQL.includes(keyword)) {
      return false;
    }
  }

  return true;
};
