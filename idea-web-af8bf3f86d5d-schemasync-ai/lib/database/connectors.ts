import * as pg from 'pg';
import * as mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/database';
import { decryptCredentials } from '../utils/encryption';
import { getSchema, cacheSchema } from '../storage/cache';

export const testConnection = async (connectionString: string, type: string): Promise<boolean> => {
  try {
    switch (type) {
      case 'postgresql':
        const pgClient = new pg.Client({ connectionString });
        await pgClient.connect();
        await pgClient.end();
        return true;

      case 'mysql':
        const mysqlConnection = await mysql.createConnection(connectionString);
        await mysqlConnection.end();
        return true;

      case 'supabase':
        const supabase = createClient(connectionString, '');
        const { data, error } = await supabase.from('test').select('*').limit(1);
        if (error) throw error;
        return true;

      default:
        throw new Error('Unsupported database type');
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export const connectToDatabase = async (database: Database) => {
  try {
    const connectionString = decryptCredentials(database.encryptedCredentials);

    switch (database.type) {
      case 'postgresql':
        return new pg.Client({ connectionString });

      case 'mysql':
        return await mysql.createConnection(connectionString);

      case 'supabase':
        return createClient(connectionString, '');

      default:
        throw new Error('Unsupported database type');
    }
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
};

export const fetchSchema = async (database: Database) => {
  try {
    const connection = await connectToDatabase(database);

    let schema: any;

    switch (database.type) {
      case 'postgresql':
        const pgClient = connection as pg.Client;
        await pgClient.connect();

        // Get tables and columns
        const tablesQuery = `
          SELECT table_name, column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = 'public'
          ORDER BY table_name, ordinal_position;
        `;
        const tablesResult = await pgClient.query(tablesQuery);

        // Get foreign keys
        const fkQuery = `
          SELECT
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
          WHERE constraint_type = 'FOREIGN KEY';
        `;
        const fkResult = await pgClient.query(fkQuery);

        schema = {
          tables: tablesResult.rows,
          foreignKeys: fkResult.rows
        };

        await pgClient.end();
        break;

      case 'mysql':
        const mysqlConnection = connection as mysql.Connection;

        // Get tables and columns
        const [tables] = await mysqlConnection.query(`
          SELECT table_name, column_name, data_type
          FROM information_schema.columns
          WHERE table_schema = '${database.databaseName}';
        `);

        // Get foreign keys
        const [foreignKeys] = await mysqlConnection.query(`
          SELECT
            TABLE_NAME as table_name,
            COLUMN_NAME as column_name,
            REFERENCED_TABLE_NAME as foreign_table_name,
            REFERENCED_COLUMN_NAME as foreign_column_name
          FROM
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE
          WHERE
            REFERENCED_TABLE_NAME IS NOT NULL
            AND TABLE_SCHEMA = '${database.databaseName}';
        `);

        schema = {
          tables,
          foreignKeys
        };

        await mysqlConnection.end();
        break;

      case 'supabase':
        const supabase = connection as ReturnType<typeof createClient>;

        // Get tables and columns
        const { data: tablesData, error: tablesError } = await supabase
          .from('information_schema.columns')
          .select('table_name, column_name, data_type')
          .eq('table_schema', 'public');

        if (tablesError) throw tablesError;

        // Get foreign keys
        const { data: fkData, error: fkError } = await supabase
          .from('information_schema.key_column_usage')
          .select('table_name, column_name, referenced_table_name, referenced_column_name')
          .not('referenced_table_name', 'is', null);

        if (fkError) throw fkError;

        schema = {
          tables: tablesData,
          foreignKeys: fkData
        };
        break;

      default:
        throw new Error('Unsupported database type');
    }

    // Cache the schema
    await cacheSchema(database.id, schema);
    return schema;
  } catch (error) {
    console.error('Failed to fetch schema:', error);
    throw error;
  }
};
