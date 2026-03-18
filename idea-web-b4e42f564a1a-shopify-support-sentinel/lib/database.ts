import * as SQLite from 'expo-sqlite';
import { Ticket, CreateTicketInput, UpdateTicketInput } from './types';

let db: SQLite.SQLiteDatabase | null = null;

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    return db;
  }
  
  db = await SQLite.openDatabaseAsync('support-sentinel.db');
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      ticketId TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      submittedAt INTEGER NOT NULL,
      expectedResponseHours INTEGER NOT NULL,
      resolvedAt INTEGER,
      notes TEXT
    );
  `);
  
  return db;
}

export async function createTicket(input: CreateTicketInput): Promise<Ticket> {
  const database = await openDatabase();
  
  const result = await database.runAsync(
    `INSERT INTO tickets (company, ticketId, description, submittedAt, expectedResponseHours, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, 'active')`,
    [
      input.company,
      input.ticketId,
      input.description,
      input.submittedAt.getTime(),
      input.expectedResponseHours,
      input.notes || null
    ]
  );
  
  const ticket = await database.getFirstAsync<any>(
    'SELECT * FROM tickets WHERE id = ?',
    [result.lastInsertRowId]
  );
  
  return mapRowToTicket(ticket);
}

export async function getTickets(status?: 'active' | 'resolved' | 'snoozed'): Promise<Ticket[]> {
  const database = await openDatabase();
  
  let query = 'SELECT * FROM tickets';
  const params: any[] = [];
  
  if (status) {
    query += ' WHERE status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY submittedAt DESC';
  
  const rows = await database.getAllAsync<any>(query, params);
  return rows.map(mapRowToTicket);
}

export async function getTicketById(id: number): Promise<Ticket | null> {
  const database = await openDatabase();
  
  const row = await database.getFirstAsync<any>(
    'SELECT * FROM tickets WHERE id = ?',
    [id]
  );
  
  return row ? mapRowToTicket(row) : null;
}

export async function updateTicket(id: number, input: UpdateTicketInput): Promise<Ticket> {
  const database = await openDatabase();
  
  const updates: string[] = [];
  const params: any[] = [];
  
  if (input.company !== undefined) {
    updates.push('company = ?');
    params.push(input.company);
  }
  
  if (input.ticketId !== undefined) {
    updates.push('ticketId = ?');
    params.push(input.ticketId);
  }
  
  if (input.description !== undefined) {
    updates.push('description = ?');
    params.push(input.description);
  }
  
  if (input.status !== undefined) {
    updates.push('status = ?');
    params.push(input.status);
    
    if (input.status === 'resolved' && !input.resolvedAt) {
      updates.push('resolvedAt = ?');
      params.push(Date.now());
    }
  }
  
  if (input.expectedResponseHours !== undefined) {
    updates.push('expectedResponseHours = ?');
    params.push(input.expectedResponseHours);
  }
  
  if (input.resolvedAt !== undefined) {
    updates.push('resolvedAt = ?');
    params.push(input.resolvedAt ? input.resolvedAt.getTime() : null);
  }
  
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    params.push(input.notes || null);
  }
  
  if (updates.length === 0) {
    throw new Error('No fields to update');
  }
  
  params.push(id);
  
  await database.runAsync(
    `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
    params
  );
  
  const ticket = await getTicketById(id);
  if (!ticket) {
    throw new Error('Ticket not found after update');
  }
  
  return ticket;
}

export async function deleteTicket(id: number): Promise<void> {
  const database = await openDatabase();
  
  await database.runAsync('DELETE FROM tickets WHERE id = ?', [id]);
}

function mapRowToTicket(row: any): Ticket {
  return {
    id: row.id,
    company: row.company,
    ticketId: row.ticketId,
    description: row.description,
    status: row.status,
    submittedAt: new Date(row.submittedAt),
    expectedResponseHours: row.expectedResponseHours,
    resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : undefined,
    notes: row.notes || undefined
  };
}
