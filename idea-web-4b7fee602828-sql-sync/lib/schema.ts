export interface Field {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BLOB';
  description?: string;
}

export interface Database {
  id: string;
  name: string;
  schema: Field[];
}

export interface Row {
  id: number;
  [key: string]: any;
}
