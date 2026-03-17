import * as FileSystem from 'expo-file-system';

export const parseCSV = (csv: string) => {
  const lines = csv.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const result = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentLine = lines[i].split(',');

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j]?.trim() || '';
    }

    result.push(obj);
  }

  return result;
};

export const parseExcel = (excel: any) => {
  // Implement Excel parsing
  return [];
};

export const detectSchema = (data: any[]) => {
  if (data.length === 0) return { columns: [], types: {} };

  const columns = Object.keys(data[0]);
  const types: any = {};

  for (const column of columns) {
    const values = data.map((row) => row[column]);
    types[column] = inferType(values);
  }

  return { columns, types };
};

const inferType = (values: any[]) => {
  const sample = values.filter(v => v !== null && v !== undefined && v !== '').slice(0, 10);
  
  if (sample.length === 0) return 'TEXT';
  
  const allIntegers = sample.every(v => /^-?\d+$/.test(String(v)));
  if (allIntegers) return 'INTEGER';
  
  const allNumbers = sample.every(v => !isNaN(Number(v)));
  if (allNumbers) return 'REAL';
  
  return 'TEXT';
};

export const createTableFromData = (tableName: string, schema: any) => {
  const columns = schema.columns.map((col: string) => {
    const type = schema.types[col] || 'TEXT';
    return `${col} ${type}`;
  }).join(', ');
  
  return `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
};

export const importToSQLite = async (db: any, tableName: string, data: any[]) => {
  if (data.length === 0) return;
  
  const schema = detectSchema(data);
  const createTableSQL = createTableFromData(tableName, schema);
  
  await new Promise((resolve, reject) => {
    db.transaction((tx: any) => {
      tx.executeSql(createTableSQL, [], () => {
        const columns = schema.columns;
        const placeholders = columns.map(() => '?').join(', ');
        const insertSQL = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        data.forEach((row: any) => {
          const values = columns.map((col: string) => row[col]);
          tx.executeSql(insertSQL, values);
        });
      }, (_, error: any) => reject(error));
    }, (error: any) => reject(error), () => resolve(true));
  });
};
