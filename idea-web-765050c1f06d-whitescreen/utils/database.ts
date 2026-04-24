import * as SQLite from 'expo-sqlite';
import { FocusMode, Widget, Theme } from '../store/types';

const db = SQLite.openDatabase('focusblank.db');

export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        // Create tables if they don't exist
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS focus_modes (
            id TEXT PRIMARY KEY,
            name TEXT,
            color TEXT,
            allowedApps TEXT
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS widgets (
            id TEXT PRIMARY KEY,
            type TEXT,
            position INTEGER,
            data TEXT
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS themes (
            id TEXT PRIMARY KEY,
            name TEXT,
            background TEXT,
            text TEXT,
            widgetBackground TEXT,
            drawerBackground TEXT,
            dark INTEGER
          );`
        );

        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS widget_data (
            widgetId TEXT PRIMARY KEY,
            data TEXT
          );`
        );
      },
      error => reject(error),
      () => resolve(true)
    );
  });
};

export const saveFocusMode = async (mode: FocusMode) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO focus_modes (id, name, color, allowedApps) VALUES (?, ?, ?, ?);',
          [mode.id, mode.name, mode.color, JSON.stringify(mode.allowedApps || [])],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getFocusModes = async (): Promise<FocusMode[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM focus_modes;',
          [],
          (_, { rows }) => {
            const modes = rows._array.map(row => ({
              id: row.id,
              name: row.name,
              color: row.color,
              allowedApps: JSON.parse(row.allowedApps)
            }));
            resolve(modes);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveWidget = async (widget: Widget) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO widgets (id, type, position) VALUES (?, ?, ?);',
          [widget.id, widget.type, widget.position],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getWidgets = async (): Promise<Widget[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM widgets ORDER BY position;',
          [],
          (_, { rows }) => {
            const widgets = rows._array.map(row => ({
              id: row.id,
              type: row.type,
              position: row.position
            }));
            resolve(widgets);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const deleteWidget = async (widgetId: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'DELETE FROM widgets WHERE id = ?;',
          [widgetId],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const saveWidgetData = async (widgetId: string, data: string) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO widget_data (widgetId, data) VALUES (?, ?);',
          [widgetId, data],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const loadWidgetData = async (widgetId: string): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT data FROM widget_data WHERE widgetId = ?;',
          [widgetId],
          (_, { rows }) => {
            if (rows.length > 0) {
              resolve(rows.item(0).data);
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

export const saveTheme = async (theme: Theme) => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'INSERT OR REPLACE INTO themes (id, name, background, text, widgetBackground, drawerBackground, dark) VALUES (?, ?, ?, ?, ?, ?, ?);',
          [
            theme.id,
            theme.name,
            theme.background,
            theme.text,
            theme.widgetBackground,
            theme.drawerBackground,
            theme.dark ? 1 : 0
          ],
          () => resolve(true),
          (_, error) => reject(error)
        );
      }
    );
  });
};

export const getThemes = async (): Promise<Theme[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      tx => {
        tx.executeSql(
          'SELECT * FROM themes;',
          [],
          (_, { rows }) => {
            const themes = rows._array.map(row => ({
              id: row.id,
              name: row.name,
              background: row.background,
              text: row.text,
              widgetBackground: row.widgetBackground,
              drawerBackground: row.drawerBackground,
              dark: row.dark === 1
            }));
            resolve(themes);
          },
          (_, error) => reject(error)
        );
      }
    );
  });
};
