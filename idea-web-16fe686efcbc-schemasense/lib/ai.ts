import { DatabaseSchema } from '../types/database';
import { OpenAI } from 'openai';
import { queryTemplates } from '../constants/queryTemplates';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const generateSQL = async (naturalLanguageQuery: string, schema: DatabaseSchema): Promise<string> => {
  try {
    // First try to match with offline templates
    const offlineMatch = queryTemplates.find(template =>
      naturalLanguageQuery.toLowerCase().includes(template.keyword)
    );

    if (offlineMatch) {
      return offlineMatch.sql;
    }

    // If no offline match, use OpenAI API
    const schemaDescription = `Database schema:
Tables: ${schema.tables.join(', ')}
Columns:
${Object.entries(schema.columns).map(([table, columns]) =>
  `- ${table}: ${columns.join(', ')}`).join('\n')}`;

    const prompt = `Convert this natural language query to SQL:
Query: "${naturalLanguageQuery}"
${schemaDescription}

SQL:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that converts natural language queries to SQL." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.3,
    });

    const sql = completion.choices[0].message.content?.trim() || '';

    if (!sql) {
      throw new Error('No SQL generated from OpenAI');
    }

    return sql;
  } catch (error) {
    console.error('AI query generation failed:', error);

    // Fallback to offline templates if API fails
    const fallbackTemplate = queryTemplates.find(template =>
      template.keyword === 'default'
    );

    if (fallbackTemplate) {
      return fallbackTemplate.sql;
    }

    throw new Error('Failed to generate SQL query and no offline fallback available');
  }
};

export const validateQuery = (sql: string): boolean => {
  // Basic SQL validation - checks for common syntax errors
  const invalidPatterns = [
    /SELECT\s+FROM/i, // Missing columns
    /FROM\s+WHERE/i, // Missing table
    /WHERE\s+GROUP BY/i, // Missing condition
    /GROUP BY\s+HAVING/i, // Missing group by
    /HAVING\s+ORDER BY/i, // Missing having condition
    /ORDER BY\s+LIMIT/i, // Missing order by
    /VALUES\s+WHERE/i, // Invalid VALUES syntax
    /INSERT\s+INTO\s+VALUES/i, // Missing columns
    /UPDATE\s+SET/i, // Missing table
    /DELETE\s+FROM/i, // Missing condition
    /JOIN\s+ON/i, // Missing join condition
  ];

  return !invalidPatterns.some(pattern => pattern.test(sql));
};

export const explainQuery = async (sql: string): Promise<string> => {
  try {
    const prompt = `Explain this SQL query in simple terms:
SQL: "${sql}"

Explanation:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a helpful assistant that explains SQL queries in simple terms." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100,
      temperature: 0.5,
    });

    const explanation = completion.choices[0].message.content?.trim() || '';

    if (!explanation) {
      throw new Error('No explanation generated from OpenAI');
    }

    return explanation;
  } catch (error) {
    console.error('Failed to explain query:', error);

    // Fallback explanation
    if (sql.includes('SELECT')) {
      return 'This query retrieves data from the database.';
    } else if (sql.includes('INSERT')) {
      return 'This query adds new data to the database.';
    } else if (sql.includes('UPDATE')) {
      return 'This query modifies existing data in the database.';
    } else if (sql.includes('DELETE')) {
      return 'This query removes data from the database.';
    }

    return 'This query performs an operation on the database.';
  }
};
