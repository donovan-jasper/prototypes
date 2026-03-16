import { Client as PgClient } from 'pg';
import { createConnection } from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

export class DatabaseConnector {
  private client: any;
  private type: string;

  constructor(type: string) {
    this.type = type;
  }

  async connect(connectionString: string) {
    switch (this.type) {
      case 'postgresql':
        this.client = new PgClient({
          connectionString,
        });
        await this.client.connect();
        break;
      case 'mysql':
        this.client = await createConnection(connectionString);
        break;
      case 'supabase':
        const [url, key] = connectionString.split('|');
        this.client = createClient(url, key);
        break;
      default:
        throw new Error('Unsupported database type');
    }
  }

  async disconnect() {
    if (this.client) {
      switch (this.type) {
        case 'postgresql':
          await this.client.end();
          break;
        case 'mysql':
          await this.client.end();
          break;
        case 'supabase':
          // Supabase client doesn't need explicit disconnect
          break;
      }
    }
  }

  async testConnection() {
    try {
      await this.client.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async query(sql: string) {
    try {
      const result = await this.client.query(sql);
      return result.rows || result[0];
    } catch (error) {
      console.error('Query failed:', error);
      throw error;
    }
  }
}
