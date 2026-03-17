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
    connectTimeout: 10000,
  });

  try {
    // Test the connection
    const conn = await pool.getConnection();
    conn.release();

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
            WHERE table_schema = ? AND table_name = ?
          `, [connection.database, table.table_name]);

          schema.tables.push({
            name: table.table_name,
            columns: columns.map((col) => ({
              name: col.column_name,
              type: mapMySQLTypeToSQLite(col.data_type),
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

          const [rows] = await pool.query(query, params);
          data.push({ name: table.name, rows });
        }

        return data;
      },

      close: async () => {
        await pool.end();
      },
    };
  } catch (error) {
    console.error('Error connecting to MySQL:', error);
    throw error;
  }
}

function mapMySQLTypeToSQLite(mysqlType) {
  const typeMap = {
    'int': 'INTEGER',
    'integer': 'INTEGER',
    'tinyint': 'INTEGER',
    'smallint': 'INTEGER',
    'mediumint': 'INTEGER',
    'bigint': 'INTEGER',
    'decimal': 'REAL',
    'numeric': 'REAL',
    'float': 'REAL',
    'double': 'REAL',
    'bit': 'INTEGER',
    'date': 'TEXT',
    'datetime': 'TEXT',
    'timestamp': 'TEXT',
    'time': 'TEXT',
    'year': 'INTEGER',
    'char': 'TEXT',
    'varchar': 'TEXT',
    'binary': 'BLOB',
    'varbinary': 'BLOB',
    'tinyblob': 'BLOB',
    'blob': 'BLOB',
    'mediumblob': 'BLOB',
    'longblob': 'BLOB',
    'tinytext': 'TEXT',
    'text': 'TEXT',
    'mediumtext': 'TEXT',
    'longtext': 'TEXT',
    'enum': 'TEXT',
    'set': 'TEXT',
    'json': 'TEXT',
  };

  return typeMap[mysqlType] || 'TEXT';
}
