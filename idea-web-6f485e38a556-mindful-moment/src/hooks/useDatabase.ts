import { DatabaseService } from '../services/database';

let dbInstance: DatabaseService | null = null;

export function useDatabase() {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}
