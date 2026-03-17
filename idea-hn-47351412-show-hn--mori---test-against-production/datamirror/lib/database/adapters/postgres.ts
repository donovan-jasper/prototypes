import { Client } from 'pg';

export async function connectToDatabase(connection) {
  const client = new Client({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
    ssl: connection.ssl || false,
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();

    return {
      getSchema: async () => {
        const tables = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_type = 'BASE TABLE'
        `);

        const schema = { tables: [] };

        for (const table of tables.rows) {
          const columns = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = $1
          `, [table.table_name]);

          schema.tables.push({
            name: table.table_name,
            columns: columns.rows.map((col) => ({
              name: col.column_name,
              type: mapPostgresTypeToSQLite(col.data_type),
            })),
          });
        }

        return schema;
      },

      getData: async (options) => {
        const data = [];
        const schema = await this.getSchema();

        for (const table of schema.tables) {
          let query = `SELECT * FROM ${table.name}`;
          const params = [];

          // Apply limit if specified
          if (options.limit) {
            query += ` LIMIT $${params.length + 1}`;
            params.push(options.limit);
          }

          // Apply table filter if specified
          if (options.tables && !options.tables.includes(table.name)) {
            continue;
          }

          const result = await client.query(query, params);
          data.push({ name: table.name, rows: result.rows });
        }

        return data;
      },

      close: async () => {
        await client.end();
      },
    };
  } catch (error) {
    console.error('Error connecting to PostgreSQL:', error);
    throw error;
  }
}

function mapPostgresTypeToSQLite(pgType) {
  const typeMap = {
    'integer': 'INTEGER',
    'bigint': 'INTEGER',
    'smallint': 'INTEGER',
    'serial': 'INTEGER',
    'bigserial': 'INTEGER',
    'numeric': 'REAL',
    'decimal': 'REAL',
    'real': 'REAL',
    'double precision': 'REAL',
    'money': 'TEXT',
    'character varying': 'TEXT',
    'varchar': 'TEXT',
    'character': 'TEXT',
    'char': 'TEXT',
    'text': 'TEXT',
    'bytea': 'BLOB',
    'timestamp': 'TEXT',
    'timestamp without time zone': 'TEXT',
    'timestamp with time zone': 'TEXT',
    'date': 'TEXT',
    'time': 'TEXT',
    'time without time zone': 'TEXT',
    'time with time zone': 'TEXT',
    'interval': 'TEXT',
    'boolean': 'INTEGER',
    'json': 'TEXT',
    'jsonb': 'TEXT',
    'uuid': 'TEXT',
    'xml': 'TEXT',
    'array': 'TEXT',
    'cidr': 'TEXT',
    'inet': 'TEXT',
    'macaddr': 'TEXT',
    'bit': 'INTEGER',
    'bit varying': 'TEXT',
    'tsvector': 'TEXT',
    'tsquery': 'TEXT',
  };

  return typeMap[pgType] || 'TEXT';
}
