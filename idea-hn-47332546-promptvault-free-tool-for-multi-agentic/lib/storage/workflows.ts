import * as SQLite from 'expo-sqlite';

interface NodeData {
  id: string;
  type: 'trigger' | 'ai' | 'action';
  label: string;
  x: number;
  y: number;
  config?: Record<string, any>;
}

interface Connection {
  from: string;
  to: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  connections: Connection[];
  created_at?: string;
  updated_at?: string;
}

let db: SQLite.SQLiteDatabase | null = null;

const getDatabase = async () => {
  if (!db) {
    db = await SQLite.openDatabaseAsync('flowforge.db');
    await initDatabase();
  }
  return db;
};

const initDatabase = async () => {
  if (!db) return;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      nodes TEXT NOT NULL,
      connections TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export const getAllWorkflows = async (): Promise<Workflow[]> => {
  const database = await getDatabase();
  const result = await database.getAllAsync<{
    id: string;
    name: string;
    description: string;
    nodes: string;
    connections: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM workflows ORDER BY updated_at DESC');

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    nodes: JSON.parse(row.nodes),
    connections: JSON.parse(row.connections),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
};

export const getWorkflowById = async (id: string): Promise<Workflow | null> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{
    id: string;
    name: string;
    description: string;
    nodes: string;
    connections: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM workflows WHERE id = ?', [id]);

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    description: result.description,
    nodes: JSON.parse(result.nodes),
    connections: JSON.parse(result.connections),
    created_at: result.created_at,
    updated_at: result.updated_at,
  };
};

export const saveWorkflow = async (workflow: Workflow): Promise<void> => {
  const database = await getDatabase();
  const existing = await getWorkflowById(workflow.id);

  if (existing) {
    await database.runAsync(
      'UPDATE workflows SET name = ?, description = ?, nodes = ?, connections = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [
        workflow.name,
        workflow.description,
        JSON.stringify(workflow.nodes),
        JSON.stringify(workflow.connections),
        workflow.id,
      ]
    );
  } else {
    await database.runAsync(
      'INSERT INTO workflows (id, name, description, nodes, connections) VALUES (?, ?, ?, ?, ?)',
      [
        workflow.id,
        workflow.name,
        workflow.description,
        JSON.stringify(workflow.nodes),
        JSON.stringify(workflow.connections),
      ]
    );
  }
};

export const deleteWorkflow = async (id: string): Promise<void> => {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM workflows WHERE id = ?', [id]);
};

export const createWorkflow = async (
  name: string,
  description: string
): Promise<Workflow> => {
  const workflow: Workflow = {
    id: `workflow-${Date.now()}`,
    name,
    description,
    nodes: [],
    connections: [],
  };

  await saveWorkflow(workflow);
  return workflow;
};
