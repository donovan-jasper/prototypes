import Papa from 'papaparse';

export const parseCSV = async (csvString: string) => {
  return new Promise<{ columns: string[], rows: any[] }>((resolve, reject) => {
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const columns = results.meta.fields || [];
        resolve({ columns, rows: results.data });
      },
      error: (error) => reject(error)
    });
  });
};

export const detectColumnTypes = (rows: any[]): Record<string, string> => {
  if (rows.length === 0) return {};
  
  const sample = rows.slice(0, Math.min(100, rows.length));
  const columns = Object.keys(sample[0]);
  const types: Record<string, string> = {};
  
  for (const col of columns) {
    let isInteger = true;
    let isReal = true;
    let isBoolean = true;
    
    for (const row of sample) {
      const value = row[col];
      if (value === null || value === undefined || value === '') continue;
      
      const str = String(value).toLowerCase();
      
      if (str !== 'true' && str !== 'false') isBoolean = false;
      if (isNaN(Number(value))) {
        isInteger = false;
        isReal = false;
      } else if (String(value).includes('.')) {
        isInteger = false;
      }
    }
    
    if (isBoolean) types[col] = 'INTEGER';
    else if (isInteger) types[col] = 'INTEGER';
    else if (isReal) types[col] = 'REAL';
    else types[col] = 'TEXT';
  }
  
  return types;
};
