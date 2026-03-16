export const getSchemaExplanationPrompt = (table: any) => {
  return {
    role: 'system',
    content: `You are an expert database consultant. Explain the following table in simple terms for non-technical users.
    Table: ${table.name}
    Columns: ${table.columns.map(c => `${c.name} (${c.type})`).join(', ')}
    Purpose: [Explain the purpose of this table in simple terms]
    Common queries: [List 2-3 common queries that might be run against this table]`,
  };
};

export const getQueryGenerationPrompt = (schema: any, naturalLanguageQuery: string) => {
  return {
    role: 'system',
    content: `You are a SQL expert. Convert the following natural language query to a safe SELECT query.
    Schema context: ${JSON.stringify(schema)}
    Natural language query: ${naturalLanguageQuery}
    SQL query: [Generate the SQL query here]
    Explanation: [Briefly explain the query in simple terms]`,
  };
};
