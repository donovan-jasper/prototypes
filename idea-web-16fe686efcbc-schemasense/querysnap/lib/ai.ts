import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const generateSQL = async (prompt, schema) => {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Convert this natural language query to SQL:\n\nSchema:\n${JSON.stringify(schema)}\n\nQuery: ${prompt}\n\nSQL:`,
    max_tokens: 100,
  });

  return response.data.choices[0].text.trim();
};

export const validateQuery = (sql) => {
  // Implement basic SQL syntax validation
  return sql.toUpperCase().startsWith('SELECT');
};

export const explainQuery = async (sql) => {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `Explain this SQL query in plain English:\n\n${sql}\n\nExplanation:`,
    max_tokens: 100,
  });

  return response.data.choices[0].text.trim();
};
