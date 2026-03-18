import { getDatabase } from './schema';
import type { Project, Screen, Component } from '@/types/project';

export async function createProject(data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
  const db = await getDatabase();
  const id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();
  
  const project: Project = {
    id,
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  await db.runAsync(
    'INSERT INTO projects (id, name, description, appType, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [project.id, project.name, project.description || '', project.appType || '', project.createdAt, project.updatedAt]
  );

  return project;
}

export async function getProject(id: string): Promise<Project | null> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<Project>(
    'SELECT * FROM projects WHERE id = ?',
    [id]
  );
  return result || null;
}

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<Project>(
    'SELECT * FROM projects ORDER BY updatedAt DESC'
  );
  return results;
}

export async function updateProject(id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>): Promise<void> {
  const db = await getDatabase();
  const now = Date.now();
  
  const updates: string[] = [];
  const values: any[] = [];
  
  if (data.name !== undefined) {
    updates.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    values.push(data.description);
  }
  if (data.appType !== undefined) {
    updates.push('appType = ?');
    values.push(data.appType);
  }
  
  updates.push('updatedAt = ?');
  values.push(now);
  values.push(id);

  await db.runAsync(
    `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
    values
  );
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
}

export async function createScreen(data: Omit<Screen, 'id'>): Promise<Screen> {
  const db = await getDatabase();
  const id = `screen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const screen: Screen = {
    id,
    ...data,
    layout: data.layout || {}, // Ensure it's an object
  };

  await db.runAsync(
    'INSERT INTO screens (id, projectId, name, "order", layout) VALUES (?, ?, ?, ?, ?)',
    [screen.id, screen.projectId, screen.name, screen.order, JSON.stringify(screen.layout)] // Stringify layout
  );

  return screen;
}

export async function getScreensByProject(projectId: string): Promise<Screen[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<{ id: string; projectId: string; name: string; order: number; layout: string }>( // Query returns string
    'SELECT * FROM screens WHERE projectId = ? ORDER BY "order"',
    [projectId]
  );
  return results.map(row => ({
    ...row,
    layout: JSON.parse(row.layout || '{}'), // Parse layout back to object
  }));
}

export async function createComponent(data: Omit<Component, 'id'>): Promise<Component> {
  const db = await getDatabase();
  const id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const component: Component = {
    id,
    ...data,
    props: data.props || {},
    position: data.position || {},
  };

  await db.runAsync(
    'INSERT INTO components (id, screenId, type, props, position, "order") VALUES (?, ?, ?, ?, ?, ?)',
    [
      component.id,
      component.screenId,
      component.type,
      JSON.stringify(component.props), // Stringify props
      JSON.stringify(component.position), // Stringify position
      component.order
    ]
  );

  return component;
}

export async function getComponentsByScreen(screenId: string): Promise<Component[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<{ id: string; screenId: string; type: string; props: string; position: string; order: number }>( // Query returns string
    'SELECT * FROM components WHERE screenId = ? ORDER BY "order"',
    [screenId]
  );
  return results.map(row => ({
    ...row,
    props: JSON.parse(row.props || '{}'), // Parse props
    position: JSON.parse(row.position || '{}'), // Parse position
  }));
}
