import axios from 'axios';

const generateSchema = async (voiceInput) => {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that converts natural language to database schemas.' },
      { role: 'user', content: `Convert this to database schema: ${voiceInput}. Return JSON array of {name, type, description}` }
    ],
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.choices[0].message.content;
};

const naturalLanguageQuery = async (question, schema) => {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: 'You are a helpful assistant that converts natural language to SQLite queries.' },
      { role: 'user', content: `Convert to SQLite query for schema ${JSON.stringify(schema)}: ${question}` }
    ],
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data.choices[0].message.content;
};

export { generateSchema, naturalLanguageQuery };
