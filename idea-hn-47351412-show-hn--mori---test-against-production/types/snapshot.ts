import { Connection } from './database';

export interface Snapshot {
  id: string;
  name: string;
  sourceConnectionId: string; // ID of the connection it was created from
  sourceConnection?: Connection; // Optional: denormalized connection details
  createdAt: string; // ISO date string
  lastSyncedAt: string; // ISO date string
  rowCount: number;
  filePath: string; // Path to the local SQLite file
  sizeBytes: number;
  isStale: boolean; // Derived property, e.g., if lastSyncedAt is > 7 days old
  // Add other properties as needed
}
