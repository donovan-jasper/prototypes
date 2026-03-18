import { getDatabase } from '../lib/database';
import { Relationship, Interaction, RelationshipHealth, RelationshipWithHealth } from '../types';

const db = getDatabase();

export const createRelationship = (data: Omit<Relationship, 'id' | 'createdAt'>): Relationship => {
  const createdAt = new Date().toISOString();
  const result = db.runSync(
    'INSERT INTO relationships (name, category, frequency, importance, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.category, data.frequency, data.importance || 5, data.notes || null, createdAt]
  );

  return {
    id: result.lastInsertRowId,
    ...data,
    createdAt,
  };
};

export const getRelationships = (category?: string): RelationshipWithHealth[] => {
  let query = 'SELECT * FROM relationships';
  const params: any[] = [];

  if (category && category !== 'All') {
    query += ' WHERE category = ?';
    params.push(category);
  }

  query += ' ORDER BY name ASC';

  const relationships = db.getAllSync(query, params) as Relationship[];

  return relationships.map(rel => {
    const lastInteraction = getLastInteraction(rel.id);
    const health = calculateHealth(rel, lastInteraction);

    return {
      ...rel,
      health,
      lastInteraction,
    };
  });
};

export const getRelationshipById = (id: number): RelationshipWithHealth | null => {
  const relationship = db.getFirstSync('SELECT * FROM relationships WHERE id = ?', [id]) as Relationship | null;

  if (!relationship) return null;

  const lastInteraction = getLastInteraction(id);
  const health = calculateHealth(relationship, lastInteraction);

  return {
    ...relationship,
    health,
    lastInteraction,
  };
};

export const updateRelationship = (id: number, data: Partial<Omit<Relationship, 'id' | 'createdAt'>>): void => {
  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.category !== undefined) {
    fields.push('category = ?');
    values.push(data.category);
  }
  if (data.frequency !== undefined) {
    fields.push('frequency = ?');
    values.push(data.frequency);
  }
  if (data.importance !== undefined) {
    fields.push('importance = ?');
    values.push(data.importance);
  }
  if (data.notes !== undefined) {
    fields.push('notes = ?');
    values.push(data.notes);
  }

  if (fields.length === 0) return;

  values.push(id);
  db.runSync(`UPDATE relationships SET ${fields.join(', ')} WHERE id = ?`, values);
};

export const deleteRelationship = (id: number): void => {
  db.runSync('DELETE FROM relationships WHERE id = ?', [id]);
};

const getLastInteraction = (relationshipId: number): Interaction | undefined => {
  const interaction = db.getFirstSync(
    'SELECT * FROM interactions WHERE relationshipId = ? ORDER BY timestamp DESC LIMIT 1',
    [relationshipId]
  ) as Interaction | null;

  return interaction || undefined;
};

export const calculateHealth = (relationship: Relationship, lastInteraction?: Interaction): RelationshipHealth => {
  const now = new Date();
  const lastContactDate = lastInteraction ? new Date(lastInteraction.timestamp) : new Date(relationship.createdAt);
  const daysSinceContact = Math.floor((now.getTime() - lastContactDate.getTime()) / (1000 * 60 * 60 * 24));

  const frequencyDays: Record<string, number> = {
    Weekly: 7,
    Monthly: 30,
    Quarterly: 90,
  };

  const expectedDays = frequencyDays[relationship.frequency] || 30;
  const ratio = daysSinceContact / expectedDays;

  let score: number;
  let status: 'healthy' | 'at-risk' | 'neglected';
  let isOverdue: boolean;

  if (ratio <= 0.8) {
    score = 100 - (ratio * 25);
    status = 'healthy';
    isOverdue = false;
  } else if (ratio <= 1.2) {
    score = 80 - ((ratio - 0.8) * 75);
    status = 'at-risk';
    isOverdue = ratio > 1.0;
  } else {
    score = Math.max(0, 50 - ((ratio - 1.2) * 25));
    status = 'neglected';
    isOverdue = true;
  }

  return {
    score: Math.round(score),
    status,
    daysSinceContact,
    isOverdue,
  };
};
