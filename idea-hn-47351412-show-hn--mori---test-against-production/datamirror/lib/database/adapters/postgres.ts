import { Client } from 'pg';

export async function connectToDatabase(connection) {
  const client = new Client({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
  });

  await client.connect();

  return {
    getSchema: async () => {
      const tables = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
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
            type: col.data_type,
          })),
        });
      }

      return schema;
    },

    getData: async (options) => {
      const data = [];

      for (const table of schema.tables) {
        const query = `SELECT * FROM ${table.name} LIMIT ${options.limit || 1000}`;
        const rows = await client.query(query);
        data.push({ name: table.name, rows: rows.rows });
      }

      return data;
    },

    close: async () => {
      await client.end();
    },
  };
}
