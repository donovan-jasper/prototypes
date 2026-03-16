export interface Query {
  id: string;
  databaseId: string;
  naturalLanguageQuery: string;
  sqlQuery: string;
  results: any[];
  timestamp: Date;
  isFavorite: boolean;
  explanation?: string;
}
