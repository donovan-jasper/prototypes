import * as SQLite from 'expo-sqlite';
import { Shelf, Item } from './schema';

export class ShelfQueries {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async createShelf(name: string, description?: string): Promise<number> {
    const maxOrder = await this.db.getFirstAsync<{ max_order: number }>(
      'SELECT COALESCE(MAX(order_index), -1) as max_order FROM shelves'
    );
    
    const result = await this.db.runAsync(
      'INSERT INTO shelves (name, description, order_index) VALUES (?, ?, ?)',
      [name, description || null, (maxOrder?.max_order ?? -1) + 1]
    );
    
    return result.lastInsertRowId;
  }

  async getShelves(): Promise<(Shelf & { item_count: number })[]> {
    const shelves = await this.db.getAllAsync<Shelf>(
      'SELECT * FROM shelves ORDER BY order_index ASC'
    );

    const shelvesWithCounts = await Promise.all(
      shelves.map(async (shelf) => {
        const count = await this.db.getFirstAsync<{ count: number }>(
          'SELECT COUNT(*) as count FROM items WHERE shelf_id = ?',
          [shelf.id]
        );
        return { ...shelf, item_count: count?.count ?? 0 };
      })
    );

    return shelvesWithCounts;
  }

  async getShelf(id: number): Promise<(Shelf & { item_count: number }) | null> {
    const shelf = await this.db.getFirstAsync<Shelf>(
      'SELECT * FROM shelves WHERE id = ?',
      [id]
    );

    if (!shelf) return null;

    const count = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM items WHERE shelf_id = ?',
      [id]
    );

    return { ...shelf, item_count: count?.count ?? 0 };
  }

  async updateShelf(id: number, data: Partial<Shelf>): Promise<void> {
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
    if (data.cover_image !== undefined) {
      updates.push('cover_image = ?');
      values.push(data.cover_image);
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.db.runAsync(
      `UPDATE shelves SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteShelf(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM shelves WHERE id = ?', [id]);
  }

  async getTotalShelfCount(): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM shelves'
    );
    return result?.count ?? 0;
  }

  async reorderShelves(shelfIds: number[]): Promise<void> {
    await this.db.withTransactionAsync(async () => {
      for (let i = 0; i < shelfIds.length; i++) {
        await this.db.runAsync(
          'UPDATE shelves SET order_index = ? WHERE id = ?',
          [i, shelfIds[i]]
        );
      }
    });
  }
}

export class ItemQueries {
  constructor(private db: SQLite.SQLiteDatabase) {}

  async createItem(
    shelfId: number,
    url: string,
    metadata: {
      title: string;
      description?: string;
      image_url?: string;
      favicon_url?: string;
      tags?: string;
    }
  ): Promise<number> {
    const result = await this.db.runAsync(
      `INSERT INTO items (shelf_id, url, title, description, image_url, favicon_url, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        shelfId,
        url,
        metadata.title,
        metadata.description || null,
        metadata.image_url || null,
        metadata.favicon_url || null,
        metadata.tags || null,
      ]
    );

    return result.lastInsertRowId;
  }

  async getItems(shelfId: number): Promise<Item[]> {
    return await this.db.getAllAsync<Item>(
      'SELECT * FROM items WHERE shelf_id = ? ORDER BY created_at DESC',
      [shelfId]
    );
  }

  async getItem(id: number): Promise<Item | null> {
    return await this.db.getFirstAsync<Item>(
      'SELECT * FROM items WHERE id = ?',
      [id]
    );
  }

  async updateItem(id: number, data: Partial<Item>): Promise<void> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(data.image_url);
    }
    if (data.tags !== undefined) {
      updates.push('tags = ?');
      values.push(data.tags);
    }

    values.push(id);

    await this.db.runAsync(
      `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteItem(id: number): Promise<void> {
    await this.db.runAsync('DELETE FROM items WHERE id = ?', [id]);
  }

  async moveItem(itemId: number, newShelfId: number): Promise<void> {
    await this.db.runAsync(
      'UPDATE items SET shelf_id = ? WHERE id = ?',
      [newShelfId, itemId]
    );
  }

  async searchItems(query: string): Promise<Item[]> {
    const searchTerm = `%${query}%`;
    return await this.db.getAllAsync<Item>(
      `SELECT * FROM items 
       WHERE title LIKE ? OR description LIKE ? OR url LIKE ? OR tags LIKE ?
       ORDER BY created_at DESC`,
      [searchTerm, searchTerm, searchTerm, searchTerm]
    );
  }

  async getShelfItemCount(shelfId: number): Promise<number> {
    const result = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) as count FROM items WHERE shelf_id = ?',
      [shelfId]
    );
    return result?.count ?? 0;
  }
}
