import { connectToDatabase as connectPostgres } from './postgres';
import { connectToDatabase as connectMySQL } from './mysql';
import { connectToDatabase as connectSQLite } from './sqlite';

export async function connectToDatabase(connection) {
  switch (connection.type) {
    case 'postgres':
      return connectPostgres(connection);
    case 'mysql':
      return connectMySQL(connection);
    case 'sqlite':
      return connectSQLite(connection);
    default:
      throw new Error(`Unsupported database type: ${connection.type}`);
  }
}
