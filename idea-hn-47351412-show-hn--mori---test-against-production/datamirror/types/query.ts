export interface Query {
  id: string;
  snapshot_id: string;
  query: string;
  executed_at: string;
  duration_ms: number;
}

export interface QueryResult {
  rows: Record<string, any>[];
  rowCount: number;
  duration: number;
}
