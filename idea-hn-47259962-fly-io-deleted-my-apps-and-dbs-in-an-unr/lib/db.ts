import * as SQLite from 'expo-sqlite';

export async function openDatabase() {
  const db = await SQLite.openDatabaseAsync('cloudguard.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      status TEXT NOT NULL,
      last_check INTEGER,
      metadata TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      resolved INTEGER DEFAULT 0,
      FOREIGN KEY (service_id) REFERENCES services(id)
    );

    CREATE TABLE IF NOT EXISTS recovery_workflows (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      steps TEXT NOT NULL
    );
  `);

  // Seed initial workflows if table is empty
  const workflows = await db.getAllAsync('SELECT * FROM recovery_workflows');
  if (workflows.length === 0) {
    const initialWorkflows = [
      {
        id: 'flyio-restart',
        name: 'Restart Fly.io App',
        provider: 'flyio',
        steps: JSON.stringify([
          {
            id: 'check-status',
            title: 'Check Current Status',
            description: 'Verify the app is actually down before restarting',
            action: {
              type: 'api',
              endpoint: 'status',
              method: 'GET'
            }
          },
          {
            id: 'execute-restart',
            title: 'Restart Application',
            description: 'This will terminate all running instances and start new ones',
            action: {
              type: 'api',
              endpoint: 'restart',
              method: 'POST'
            }
          },
          {
            id: 'verify-restart',
            title: 'Verify Restart',
            description: 'Check that the app is back online after restart',
            action: {
              type: 'api',
              endpoint: 'status',
              method: 'GET'
            }
          }
        ])
      },
      {
        id: 'flyio-rollback',
        name: 'Rollback Deployment',
        provider: 'flyio',
        steps: JSON.stringify([
          {
            id: 'check-deployments',
            title: 'Review Deployment History',
            description: 'Identify the last stable version before the issue appeared',
            action: {
              type: 'manual'
            }
          },
          {
            id: 'execute-rollback',
            title: 'Rollback to Previous Version',
            description: 'This will revert to the last known good deployment',
            action: {
              type: 'api',
              endpoint: 'rollback',
              method: 'POST'
            }
          },
          {
            id: 'verify-rollback',
            title: 'Verify Rollback',
            description: 'Check that the app is functioning correctly after rollback',
            action: {
              type: 'api',
              endpoint: 'status',
              method: 'GET'
            }
          }
        ])
      }
    ];

    for (const workflow of initialWorkflows) {
      await db.runAsync(
        'INSERT INTO recovery_workflows (id, name, provider, steps) VALUES (?, ?, ?, ?)',
        [workflow.id, workflow.name, workflow.provider, workflow.steps]
      );
    }
  }

  return db;
}

export async function saveService(db: SQLite.SQLiteDatabase, service: any) {
  await db.runAsync(
    'INSERT OR REPLACE INTO services (id, name, provider, status, last_check, metadata) VALUES (?, ?, ?, ?, ?, ?)',
    [service.id, service.name, service.provider, service.status, Date.now(), JSON.stringify(service.metadata || {})]
  );
}

export async function getServices(db: SQLite.SQLiteDatabase) {
  return await db.getAllAsync('SELECT * FROM services ORDER BY name');
}

export async function saveAlert(db: SQLite.SQLiteDatabase, alert: any) {
  await db.runAsync(
    'INSERT INTO alerts (service_id, severity, message, timestamp) VALUES (?, ?, ?, ?)',
    [alert.serviceId, alert.severity, alert.message, Date.now()]
  );
}
