import { Pool } from 'pg';

interface DataFetchOptions {
  limit: number;
  tables: string[];
  dateRange: { start: string; end: string };
}

interface Connection {
  type: string;
  host: string;
  database: string;
  username: string;
  password: string;
}

const fetchData = async (connection: Connection, options: DataFetchOptions) => {
  const pool = new Pool({
    user: connection.username,
    host: connection.host,
    database: connection.database,
    password: connection.password,
    port: 5432,
  });

  const tables = options.tables;
  const limit = options.limit;
  const dateRange = options.dateRange;

  const results: any[] = [];

  for (const table of tables) {
    const query = {
      text: `SELECT * FROM ${table} WHERE created_at BETWEEN $1 AND $2 LIMIT $3`,
      values: [dateRange.start, dateRange.end, limit],
    };

    const res = await pool.query(query);
    results.push(...res.rows);
  }

  await pool.end();

  return results;
};

const getSchema = async (connection: Connection) => {
  const pool = new Pool({
    user: connection.username,
    host: connection.host,
    database: connection.database,
    password: connection.password,
    port: 5432,
  });

  const query = {
    text: 'SELECT table_name FROM information_schema.tables WHERE table_schema = $1',
    values: ['public'],
  };

  const res = await pool.query(query);
  const tables = res.rows.map((row) => row.table_name);

  const schema: any = {};

  for (const table of tables) {
    const query = {
      text: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1`,
      values: [table],
    };

    const res = await pool.query(query);
    schema[table] = res.rows;
  }

  await pool.end();

  return schema;
};

export { fetchData, getSchema };
