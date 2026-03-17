import Constants from 'expo-constants';
import OpenAI from 'openai';
import { queryTemplates } from '../constants/queryTemplates';

const getApiKey = () => {
  return Constants.expoConfig?.extra?.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY;
};

let openaiClient: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openaiClient) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return openaiClient;
};

interface Schema {
  tables: string[];
  columns: Record<string, string[]>;
  types?: Record<string, Record<string, string>>;
}

export const generateSQL = async (prompt: string, schema: Schema): Promise<string> => {
  try {
    const client = getOpenAIClient();
    
    const schemaContext = Object.entries(schema.columns)
      .map(([table, columns]) => {
        const columnDefs = columns.map(col => {
          const type = schema.types?.[table]?.[col] || 'TEXT';
          return `  ${col} ${type}`;
        }).join('\n');
        return `Table: ${table}\n${columnDefs}`;
      })
      .join('\n\n');

    const systemPrompt = `You are a SQL query generator. Convert natural language questions into valid SQLite queries.

Database Schema:
${schemaContext}

Rules:
- Generate ONLY the SQL query, no explanations
- Use proper SQLite syntax
- Always use table and column names exactly as shown in the schema
- For aggregations, use appropriate GROUP BY clauses
- For date comparisons, assume dates are stored as TEXT in ISO format
- Limit results to 100 rows unless specified otherwise`;

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    const sql = response.choices[0]?.message?.content?.trim() || '';
    
    if (!sql) {
      throw new Error('No SQL generated');
    }

    return sql.replace(/
