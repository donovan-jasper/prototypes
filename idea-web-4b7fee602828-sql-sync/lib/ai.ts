import axios from 'axios';

interface Field {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
  description?: string;
}

const generateSchema = async (voiceInput: string): Promise<Field[]> => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that converts natural language to database schemas. Return a JSON array of objects with "name", "type", and "description" properties. Supported types are TEXT, INTEGER, REAL, and BLOB.'
        },
        {
          role: 'user',
          content: `Convert this to database schema: ${voiceInput}. Return JSON array of {name, type, description}`
        }
      ],
      temperature: 0.3,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const content = response.data.choices[0].message.content;
    // Parse the JSON response
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating schema:', error);
    throw new Error('Failed to generate database schema. Please try again.');
  }
};

const naturalLanguageQuery = async (question: string, schema: Field[]): Promise<string> => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that converts natural language to SQLite queries. The database schema is: ${JSON.stringify(schema)}. Return only the SQL query without any explanation.`
        },
        {
          role: 'user',
          content: `Convert this to SQLite query: ${question}`
        }
      ],
      temperature: 0.3,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const sql = response.data.choices[0].message.content.trim();

    // Basic security check to prevent dangerous operations
    if (sql.toLowerCase().includes('drop') ||
        sql.toLowerCase().includes('delete') && !sql.toLowerCase().includes('where')) {
      throw new Error('Query contains potentially dangerous operations');
    }

    return sql;
  } catch (error) {
    console.error('Error generating query:', error);
    throw new Error('Failed to generate SQL query. Please try a different question.');
  }
};

export { generateSchema, naturalLanguageQuery };
