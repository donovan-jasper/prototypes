import { Database } from 'expo-sqlite';
import { queryTemplates } from '../constants/queryTemplates';
import { Configuration, OpenAIApi } from 'openai';

interface SchemaInfo {
  tables: string[];
  columns: Record<string, string[]>;
  types: Record<string, Record<string, string>>;
}

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const generateSQL = async (naturalQuery: string, schema: SchemaInfo): Promise<string> => {
  try {
    // First try to match against offline patterns
    const offlinePattern = getOfflineQueryPattern(naturalQuery);
    if (offlinePattern) {
      return offlinePattern;
    }

    // If online, use OpenAI API
    const prompt = `Given the following database schema:
Tables: ${schema.tables.join(', ')}
Columns: ${JSON.stringify(schema.columns)}
Types: ${JSON.stringify(schema.types)}

Convert this natural language query to SQL: "${naturalQuery}"`;

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a SQL query generator. Only respond with valid SQL queries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.2,
    });

    const sql = response.data.choices[0].message?.content?.trim() || '';

    // Validate the generated SQL
    if (!validateQuery(sql)) {
      throw new Error('Generated SQL contains unsafe operations');
    }

    return sql;

  } catch (error) {
    console.error('SQL generation failed:', error);

    // Fallback to simple pattern matching if API fails
    const fallbackSQL = generateFallbackSQL(naturalQuery, schema);
    if (fallbackSQL) {
      return fallbackSQL;
    }

    throw error;
  }
};

export const validateQuery = (sql: string): boolean => {
  // Basic SQL syntax validation
  const forbiddenPatterns = [
    /;.*;/i, // Multiple statements
    /DROP\s+TABLE/i, // DROP TABLE
    /DELETE\s+FROM/i, // DELETE FROM
    /INSERT\s+INTO/i, // INSERT INTO
    /UPDATE\s+/i, // UPDATE
    /CREATE\s+TABLE/i, // CREATE TABLE
    /ALTER\s+TABLE/i, // ALTER TABLE
    /TRUNCATE\s+TABLE/i, // TRUNCATE TABLE
    /EXEC\s+/i, // EXEC commands
    /EXECUTE\s+/i, // EXECUTE commands
    /DECLARE\s+/i, // DECLARE statements
    /BEGIN\s+TRANSACTION/i, // BEGIN TRANSACTION
    /COMMIT/i, // COMMIT
    /ROLLBACK/i, // ROLLBACK
    /SAVEPOINT/i, // SAVEPOINT
    /GRANT\s+/i, // GRANT permissions
    /REVOKE\s+/i, // REVOKE permissions
    /SHUTDOWN\s+/i, // SHUTDOWN
    /KILL\s+/i, // KILL processes
    /BACKUP\s+/i, // BACKUP
    /RESTORE\s+/i, // RESTORE
    /USE\s+/i, // USE database
    /ATTACH\s+/i, // ATTACH database
    /DETACH\s+/i, // DETACH database
    /PRAGMA\s+/i, // PRAGMA commands
    /VACUUM/i, // VACUUM
    /ANALYZE/i, // ANALYZE
    /REINDEX/i, // REINDEX
    /EXPLAIN\s+/i, // EXPLAIN queries
    /WITH\s+RECURSIVE/i, // WITH RECURSIVE
    /MERGE\s+/i, // MERGE
    /UPSERT/i, // UPSERT
    /RETURNING\s+/i, // RETURNING clause
    /LIMIT\s+\d+\s+OFFSET/i, // LIMIT OFFSET
    /FETCH\s+FIRST/i, // FETCH FIRST
    /FOR\s+UPDATE/i, // FOR UPDATE
    /LOCK\s+IN\s+SHARE\s+MODE/i, // LOCK IN SHARE MODE
    /WAIT\s+\d+/i, // WAIT
    /NOWAIT/i, // NOWAIT
    /SKIP\s+LOCKED/i, // SKIP LOCKED
    /INTO\s+OUTFILE/i, // INTO OUTFILE
    /INTO\s+DUMPFILE/i, // INTO DUMPFILE
    /LOAD\s+DATA/i, // LOAD DATA
    /HANDLER/i, // HANDLER
    /XA\s+/i, // XA transactions
    /PREPARE\s+/i, // PREPARE statements
    /EXECUTE\s+/i, // EXECUTE statements
    /DEALLOCATE\s+PREPARE/i, // DEALLOCATE PREPARE
    /CALL\s+/i, // CALL procedures
    /SHOW\s+/i, // SHOW commands
    /DESCRIBE\s+/i, // DESCRIBE
    /DESC\s+/i, // DESC
    /HELP\s+/i, // HELP
    /SET\s+PASSWORD/i, // SET PASSWORD
    /SET\s+TRANSACTION/i, // SET TRANSACTION
    /SET\s+NAMES/i, // SET NAMES
    /SET\s+CHARACTER\s+SET/i, // SET CHARACTER SET
    /SET\s+SESSION/i, // SET SESSION
    /SET\s+GLOBAL/i, // SET GLOBAL
    /SET\s+PERSIST/i, // SET PERSIST
    /SET\s+PERSIST_ONLY/i, // SET PERSIST_ONLY
    /RESET\s+PERSIST/i, // RESET PERSIST
    /RESET\s+QUERY\s+CACHE/i, // RESET QUERY CACHE
    /KILL\s+QUERY/i, // KILL QUERY
    /FLUSH\s+/i, // FLUSH commands
    /RESET\s+MASTER/i, // RESET MASTER
    /CHANGE\s+MASTER/i, // CHANGE MASTER
    /START\s+SLAVE/i, // START SLAVE
    /STOP\s+SLAVE/i, // STOP SLAVE
    /RESET\s+SLAVE/i, // RESET SLAVE
    /START\s+GROUP\s+REPLICATION/i, // START GROUP REPLICATION
    /STOP\s+GROUP\s+REPLICATION/i, // STOP GROUP REPLICATION
    /RESET\s+GROUP\s+REPLICATION/i, // RESET GROUP REPLICATION
    /INSTALL\s+PLUGIN/i, // INSTALL PLUGIN
    /UNINSTALL\s+PLUGIN/i, // UNINSTALL PLUGIN
    /CREATE\s+SERVER/i, // CREATE SERVER
    /ALTER\s+SERVER/i, // ALTER SERVER
    /DROP\s+SERVER/i, // DROP SERVER
    /CREATE\s+EVENT/i, // CREATE EVENT
    /ALTER\s+EVENT/i, // ALTER EVENT
    /DROP\s+EVENT/i, // DROP EVENT
  ];

  // Check for forbidden patterns
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(sql)) {
      return false;
    }
  }

  // Basic SELECT validation
  if (!/^SELECT\s/i.test(sql)) {
    return false;
  }

  return true;
};

const getOfflineQueryPattern = (query: string): string | null => {
  // Simple pattern matching for common queries
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('show all') && lowerQuery.includes('customers')) {
    return 'SELECT * FROM customers';
  }

  if (lowerQuery.includes('orders') && lowerQuery.includes('over')) {
    const amountMatch = query.match(/\$?(\d+)/);
    if (amountMatch) {
      return `SELECT * FROM orders WHERE total > ${amountMatch[1]}`;
    }
  }

  // Add more patterns as needed
  return null;
};

const generateFallbackSQL = (query: string, schema: SchemaInfo): string | null => {
  // Simple fallback logic
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('show') && lowerQuery.includes('all')) {
    // Try to find a table that matches the query
    for (const table of schema.tables) {
      if (lowerQuery.includes(table.toLowerCase())) {
        return `SELECT * FROM ${table}`;
      }
    }
  }

  return null;
};
