interface Field {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
  description?: string;
}

interface Database {
  id: string;
  name: string;
  schema: Field[];
  rowCount?: number;
}

interface Row {
  id: number;
  [key: string]: any;
}

interface SyncOperation {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  data?: any;
  rowId?: number;
}

export { Field, Database, Row, SyncOperation };
