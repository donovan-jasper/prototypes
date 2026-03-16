import Database from 'better-sqlite3';

export async function connectToDatabase(connection) {
  const db = new Database(connection.database);

  return {
    getSchema: async () => {
      const tables = db.prepare(`
        SELECT name
        FROM sqlite_master
        WHERE type = 'table'
      `).all();

      const schema = { tables: [] };

      for (const table of tables) {
        const columns = db.prepare(`
          PRAGMA table_info(${table.name})
        `).all();

        schema.tables.push({
          name: table.name,
          columns: columns.map((col) => ({
            name: col.name,
            type: col.type,
          })),
        });
      }

      return schema;
    },

    getData: async (options) => {
      const data = [];

      for (const table of schema.tables) {
        const query = `SELECT * FROM ${table.name} LIMIT ${options.limit || 1000}`;
        const rows = db.prepare(query).all();
        data.push({ name: table.name, rows });
      }

      return data;
    },

    close: async () => {
      db.close();
    },
  };
}
