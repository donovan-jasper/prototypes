import mysql from 'mysql2/promise';

export async function connectToDatabase(connection) {
  const pool = mysql.createPool({
    host: connection.host,
    port: connection.port,
    database: connection.database,
    user: connection.username,
    password: connection.password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return {
    getSchema: async () => {
      const [tables] = await pool.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = ?
      `, [connection.database]);

      const schema = { tables: [] };

      for (const table of tables) {
        const [columns] = await pool.query(`
          SELECT column_name, data_type
          FROM information_schema.columns
          WHERE table_name = ?
        `, [table.table_name]);

        schema.tables.push({
          name: table.table_name,
          columns: columns.map((col) => ({
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
        const query = `SELECT * FROM ${table.table_name} LIMIT ${options.limit || 1000}`;
        const [rows] = await pool.query(query);
        data.push({ name: table.table_name, rows });
      }

      return data;
    },

    close: async () => {
      await pool.end();
    },
  };
}
