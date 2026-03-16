export interface Snapshot {
  id: string;
  name: string;
  source_connection: string;
  created_at: string;
  row_count: number;
  file_path: string;
  schema: DatabaseSchema;
}

export interface SnapshotOptions {
  limit?: number;
  tables?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}
