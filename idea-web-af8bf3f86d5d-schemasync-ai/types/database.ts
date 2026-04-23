export interface Database {
  id: string;
  name: string;
  type: 'postgresql' | 'mysql' | 'supabase';
  host: string;
  port: string;
  username: string;
  encryptedCredentials: string;
  databaseName: string;
  lastSync: Date;
  schema: any | null;
}
