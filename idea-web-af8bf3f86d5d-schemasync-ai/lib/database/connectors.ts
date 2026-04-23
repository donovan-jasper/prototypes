import { decryptCredentials } from '@/lib/utils/encryption';
import { getDatabaseById } from '@/lib/storage/sqlite';
import { Client as PgClient } from 'pg';
import { createConnection as createMysqlConnection } from 'mysql2/promise';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function fetchSchemaFromDatabase(databaseId: string): Promise<any> {
  const dbConfig = await getDatabaseById(databaseId);
  if (!dbConfig) {
    throw new Error('Database not found');
  }

  const credentials = decryptCredentials(dbConfig.credentials);

  switch (dbConfig.type) {
    case 'postgresql':
      return fetchPostgresSchema(credentials);
    case 'mysql':
      return fetchMysqlSchema(credentials);
    case 'supabase':
      return fetchSupabaseSchema(credentials);
    default:
      throw new Error('Unsupported database type');
  }
}

async function fetchPostgresSchema(connectionString: string): Promise<any> {
  const client = new PgClient({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    // Get tables and columns
    const tablesResult = await client.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position
    `);

    // Get foreign key relationships
    const fkResult = await client.query(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column
      FROM
        information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu
          ON ccu.constraint_name = tc.constraint_name
      WHERE
        tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
    `);

    return {
      tables: tablesResult.rows,
      relationships: fkResult.rows
    };
  } finally {
    await client.end();
  }
}

async function fetchMysqlSchema(connectionString: string): Promise<any> {
  const connection = await createMysqlConnection(connectionString);

  try {
    // Get tables and columns
    const [tables] = await connection.query(`
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
      ORDER BY table_name, ordinal_position
    `);

    // Get foreign key relationships
    const [relationships] = await connection.query(`
      SELECT
        TABLE_NAME as table_name,
        COLUMN_NAME as column_name,
        REFERENCED_TABLE_NAME as foreign_table,
        REFERENCED_COLUMN_NAME as foreign_column
      FROM
        information_schema.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_NAME IS NOT NULL
        AND TABLE_SCHEMA = DATABASE()
    `);

    return {
      tables,
      relationships
    };
  } finally {
    await connection.end();
  }
}

async function fetchSupabaseSchema(connectionString: string): Promise<any> {
  const [url, key] = connectionString.split('|');
  const supabase = createSupabaseClient(url, key);

  // For Supabase, we'll use the REST API to get schema info
  const { data: tables, error } = await supabase
    .from('information_schema.columns')
    .select('table_name, column_name, data_type')
    .eq('table_schema', 'public')
    .order('table_name, ordinal_position');

  if (error) {
    throw error;
  }

  const { data: relationships } = await supabase
    .from('information_schema.key_column_usage')
    .select('table_name, column_name, referenced_table_name, referenced_column_name')
    .eq('table_schema', 'public')
    .not('referenced_table_name', 'is', null);

  return {
    tables,
    relationships
  };
}
