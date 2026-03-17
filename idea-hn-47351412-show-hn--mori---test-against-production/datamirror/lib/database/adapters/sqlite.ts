import Database from 'better-sqlite3';

export async function connectToDatabase(connection) {
  try {
    const db = new Database(connection.database);

    return {
      getSchema: async () => {
        const tables = db.prepare(`
          SELECT name
          FROM sqlite_master
          WHERE type = 'table'
          AND name NOT LIKE 'sqlite_%'
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
        const schema = await this.getSchema();

        for (const table of schema.tables) {
          let query = `SELECT * FROM ${table.name}`;
          const params = [];

          // Apply limit if specified
          if (options.limit) {
            query += ` LIMIT ?`;
            params.push(options.limit);
          }

          // Apply table filter if specified
          if (options.tables && !options.tables.includes(table.name)) {
            continue;
          }

          const stmt = db.prepare(query);
          const rows = stmt.all(...params);
          data.push({ name: table.name, rows });
        }

        return data;
      },

      close: async () => {
        db.close();
      },
    };
  } catch (error) {
    console.error('Error connecting to SQLite:', error);
    throw error;
  }
}
