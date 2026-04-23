import { DatabaseSchema } from '../types/database';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'your-api-key';

export const generateSQL = async (naturalLanguageQuery: string, schema: DatabaseSchema): Promise<string> => {
  try {
    // In a real implementation, this would call OpenAI's API
    // This is a simplified version that demonstrates the concept

    // Convert schema to a string representation
    const schemaDescription = `Database schema:
Tables: ${schema.tables.join(', ')}
Columns:
${Object.entries(schema.columns).map(([table, columns]) =>
  `- ${table}: ${columns.join(', ')}`).join('\n')}`;

    // Create a prompt for the AI
    const prompt = `Convert this natural language query to SQL:
Query: "${naturalLanguageQuery}"
${schemaDescription}

SQL:`;

    // In a real app, you would make an API call to OpenAI here
    // For this example, we'll simulate a response
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simple pattern matching for demonstration
    if (naturalLanguageQuery.toLowerCase().includes('customers')) {
      return 'SELECT * FROM customers WHERE orders > 100';
    } else if (naturalLanguageQuery.toLowerCase().includes('orders')) {
      return 'SELECT * FROM orders WHERE date > date("now", "-30 days")';
    } else {
      return 'SELECT * FROM products WHERE stock < 10';
    }
  } catch (error) {
    console.error('AI query generation failed:', error);
    throw new Error('Failed to generate SQL query');
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
    // In a real implementation, this would call OpenAI's API
    // to explain the SQL in natural language

    // For this example, we'll provide a simple explanation
    await new Promise(resolve => setTimeout(resolve, 800));

    if (sql.includes('SELECT * FROM customers')) {
      return 'This query retrieves all customer records from the database.';
    } else if (sql.includes('WHERE orders > 100')) {
      return 'This query finds customers who have placed more than 100 orders.';
    } else {
      return 'This query retrieves information from the database based on your request.';
    }
  } catch (error) {
    console.error('Failed to explain query:', error);
    throw new Error('Failed to generate query explanation');
  }
};
