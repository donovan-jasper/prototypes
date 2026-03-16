import * as SQLite from 'expo-sqlite';
import { Contact, Interaction } from '../types';

const db = SQLite.openDatabase('connectcircle.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
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
            FOREIGN KEY (contactId) REFERENCES contacts (id)
          );`
        );
      },
      error => reject(error),
      () => resolve(true)
    );
  });
};

export const insertContact = async (contact: Omit<Contact, 'id'>) => {
  const id = Date.now().toString();
  const createdAt = new Date().toISOString();

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO contacts (id, name, phone, email, frequency, lastContact, notes, relationship, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            id,
            contact.name,
            contact.phone || null,
            contact.email || null,
            contact.frequency,
            contact.lastContact.toISOString(),
            contact.notes || null,
            contact.relationship || null,
            createdAt,
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const updateContact = async (contact: Contact) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `UPDATE contacts
           SET name = ?, phone = ?, email = ?, frequency = ?, lastContact = ?, notes = ?, relationship = ?
           WHERE id = ?;`,
          [
            contact.name,
            contact.phone || null,
            contact.email || null,
            contact.frequency,
            contact.lastContact.toISOString(),
            contact.notes || null,
            contact.relationship || null,
            contact.id,
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteContact = async (id: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `DELETE FROM contacts WHERE id = ?;`,
          [id],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getContacts = async (): Promise<Contact[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM contacts;`,
          [],
          (_, result) => {
            const contacts = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              contacts.push({
                id: row.id,
                name: row.name,
                phone: row.phone,
                email: row.email,
                frequency: row.frequency,
                lastContact: new Date(row.lastContact),
                notes: row.notes,
                relationship: row.relationship,
                createdAt: new Date(row.createdAt),
              });
            }
            resolve(contacts);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getContactById = async (id: string): Promise<Contact | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM contacts WHERE id = ?;`,
          [id],
          (_, result) => {
            if (result.rows.length > 0) {
              const row = result.rows.item(0);
              resolve({
                id: row.id,
                name: row.name,
                phone: row.phone,
                email: row.email,
                frequency: row.frequency,
                lastContact: new Date(row.lastContact),
                notes: row.notes,
                relationship: row.relationship,
                createdAt: new Date(row.createdAt),
              });
            } else {
              resolve(null);
            }
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const logInteraction = async (interaction: Omit<Interaction, 'id'>) => {
  const id = Date.now().toString();

  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `INSERT INTO interactions (id, contactId, date, type, notes)
           VALUES (?, ?, ?, ?, ?);`,
          [
            id,
            interaction.contactId,
            interaction.date.toISOString(),
            interaction.type,
            interaction.notes || null,
          ],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );

        // Update last contact date for the contact
        tx.executeSql(
          `UPDATE contacts SET lastContact = ? WHERE id = ?;`,
          [interaction.date.toISOString(), interaction.contactId],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getInteractionsByContact = async (contactId: string): Promise<Interaction[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          `SELECT * FROM interactions WHERE contactId = ? ORDER BY date DESC;`,
          [contactId],
          (_, result) => {
            const interactions = [];
            for (let i = 0; i < result.rows.length; i++) {
              const row = result.rows.item(i);
              interactions.push({
                id: row.id,
                contactId: row.contactId,
                date: new Date(row.date),
                type: row.type,
                notes: row.notes,
              });
            }
            resolve(interactions);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};
