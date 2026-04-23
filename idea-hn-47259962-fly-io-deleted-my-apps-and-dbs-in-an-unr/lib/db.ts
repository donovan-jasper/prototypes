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

    CREATE TABLE IF NOT EXISTS workflow_executions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workflow_id TEXT NOT NULL,
      service_id TEXT NOT NULL,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      status TEXT NOT NULL,
      FOREIGN KEY (workflow_id) REFERENCES recovery_workflows(id),
      FOREIGN KEY (service_id) REFERENCES services(id)
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
      },
      {
        id: 'flyio-backup',
        name: 'Verify Backups',
        provider: 'flyio',
        steps: JSON.stringify([
          {
            id: 'check-backup-age',
            title: 'Check Backup Age',
            description: 'Verify the most recent backup is within the expected time window',
            action: {
              type: 'manual'
            }
          },
          {
            id: 'test-restore',
            title: 'Test Restore Process',
            description: 'Simulate restoring from backup to ensure it works',
            action: {
              type: 'manual'
            }
          },
          {
            id: 'document-backup',
            title: 'Document Backup Details',
            description: 'Record backup location and restore instructions for future reference',
            action: {
              type: 'manual'
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

export async function getAlerts(db: SQLite.SQLiteDatabase, serviceId?: string) {
  if (serviceId) {
    return await db.getAllAsync(
      'SELECT * FROM alerts WHERE service_id = ? ORDER BY timestamp DESC',
      [serviceId]
    );
  }
  return await db.getAllAsync('SELECT * FROM alerts ORDER BY timestamp DESC');
}

export async function markAlertResolved(db: SQLite.SQLiteDatabase, alertId: number) {
  await db.runAsync(
    'UPDATE alerts SET resolved = 1 WHERE id = ?',
    [alertId]
  );
}

export async function saveWorkflowExecution(db: SQLite.SQLiteDatabase, execution: any) {
  await db.runAsync(
    'INSERT INTO workflow_executions (workflow_id, service_id, started_at, completed_at, status) VALUES (?, ?, ?, ?, ?)',
    [
      execution.workflowId,
      execution.serviceId,
      execution.startedAt,
      execution.completedAt || null,
      execution.status
    ]
  );
}

export async function getWorkflowExecutions(db: SQLite.SQLiteDatabase, serviceId?: string) {
  if (serviceId) {
    return await db.getAllAsync(
      'SELECT * FROM workflow_executions WHERE service_id = ? ORDER BY started_at DESC',
      [serviceId]
    );
  }
  return await db.getAllAsync('SELECT * FROM workflow_executions ORDER BY started_at DESC');
}
