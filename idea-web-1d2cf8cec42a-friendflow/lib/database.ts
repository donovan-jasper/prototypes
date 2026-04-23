import * as SQLite from 'expo-sqlite';
import { Contact, Interaction } from '../types';

const db = SQLite.openDatabase('connectcircle.db');

export const initDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS contacts (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            phone TEXT,
            email TEXT,
            frequency INTEGER NOT NULL,
            lastContact TEXT NOT NULL,
            notes TEXT,
            relationship TEXT,
            createdAt TEXT NOT NULL
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS interactions (
            id TEXT PRIMARY KEY,
            contactId TEXT NOT NULL,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            notes TEXT,
            FOREIGN KEY (contactId) REFERENCES contacts(id)
          );`
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
        console.log('Database initialized successfully');
        resolve();
      }
    );
  });
};

export const insertContact = async (contact: Omit<Contact, 'id'>): Promise<string> => {
  const id = Date.now().toString();
  const contactWithId = { ...contact, id };

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO contacts (id, name, phone, email, frequency, lastContact, notes, relationship, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            contact.name,
            contact.phone || null,
            contact.email || null,
            contact.frequency,
            contact.lastContact.toISOString(),
            contact.notes || null,
            contact.relationship || null,
            contact.createdAt.toISOString(),
          ],
          () => resolve(id),
          (_, error) => {
            console.error('Error inserting contact:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getContacts = async (): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM contacts',
          [],
          (_, { rows }) => {
            const contacts: Contact[] = rows._array.map((row) => ({
              ...row,
              frequency: Number(row.frequency),
              lastContact: new Date(row.lastContact),
              createdAt: new Date(row.createdAt),
            }));
            resolve(contacts);
          },
          (_, error) => {
            console.error('Error fetching contacts:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getContactById = async (id: string): Promise<Contact | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM contacts WHERE id = ?',
          [id],
          (_, { rows }) => {
            if (rows.length === 0) {
              resolve(null);
              return;
            }

            const row = rows.item(0);
            const contact: Contact = {
              ...row,
              frequency: Number(row.frequency),
              lastContact: new Date(row.lastContact),
              createdAt: new Date(row.createdAt),
            };
            resolve(contact);
          },
          (_, error) => {
            console.error('Error fetching contact by ID:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const updateContact = async (id: string, updates: Partial<Contact>): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const setClauses: string[] = [];
        const params: any[] = [];

        if (updates.name !== undefined) {
          setClauses.push('name = ?');
          params.push(updates.name);
        }
        if (updates.phone !== undefined) {
          setClauses.push('phone = ?');
          params.push(updates.phone || null);
        }
        if (updates.email !== undefined) {
          setClauses.push('email = ?');
          params.push(updates.email || null);
        }
        if (updates.frequency !== undefined) {
          setClauses.push('frequency = ?');
          params.push(updates.frequency);
        }
        if (updates.lastContact !== undefined) {
          setClauses.push('lastContact = ?');
          params.push(updates.lastContact.toISOString());
        }
        if (updates.notes !== undefined) {
          setClauses.push('notes = ?');
          params.push(updates.notes || null);
        }
        if (updates.relationship !== undefined) {
          setClauses.push('relationship = ?');
          params.push(updates.relationship || null);
        }

        if (setClauses.length === 0) {
          resolve();
          return;
        }

        params.push(id);

        tx.executeSql(
          `UPDATE contacts SET ${setClauses.join(', ')} WHERE id = ?`,
          params,
          () => resolve(),
          (_, error) => {
            console.error('Error updating contact:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const deleteContact = async (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'DELETE FROM contacts WHERE id = ?',
          [id],
          () => {
            tx.executeSql(
              'DELETE FROM interactions WHERE contactId = ?',
              [id],
              () => resolve(),
              (_, error) => {
                console.error('Error deleting interactions:', error);
                reject(error);
              }
            );
          },
          (_, error) => {
            console.error('Error deleting contact:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const insertInteraction = async (interaction: Omit<Interaction, 'id'>): Promise<string> => {
  const id = Date.now().toString();
  const interactionWithId = { ...interaction, id };

  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `INSERT INTO interactions (id, contactId, date, type, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            interaction.contactId,
            interaction.date.toISOString(),
            interaction.type,
            interaction.notes || null,
          ],
          () => {
            // Update the contact's lastContact date
            tx.executeSql(
              'UPDATE contacts SET lastContact = ? WHERE id = ?',
              [interaction.date.toISOString(), interaction.contactId],
              () => resolve(id),
              (_, error) => {
                console.error('Error updating contact lastContact:', error);
                reject(error);
              }
            );
          },
          (_, error) => {
            console.error('Error inserting interaction:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getInteractions = async (): Promise<Interaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM interactions',
          [],
          (_, { rows }) => {
            const interactions: Interaction[] = rows._array.map((row) => ({
              ...row,
              date: new Date(row.date),
            }));
            resolve(interactions);
          },
          (_, error) => {
            console.error('Error fetching interactions:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getInteractionsByContact = async (contactId: string): Promise<Interaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'SELECT * FROM interactions WHERE contactId = ? ORDER BY date DESC',
          [contactId],
          (_, { rows }) => {
            const interactions: Interaction[] = rows._array.map((row) => ({
              ...row,
              date: new Date(row.date),
            }));
            resolve(interactions);
          },
          (_, error) => {
            console.error('Error fetching interactions by contact:', error);
            reject(error);
          }
        );
      }
    );
  });
};
