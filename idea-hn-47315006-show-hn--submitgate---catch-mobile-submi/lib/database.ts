import * as SQLite from 'expo-sqlite';
import { ComplianceIssue, ScanResult } from './types';

const db = SQLite.openDatabase('submitguard.db');

export const initDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Create scans table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS scans (
            id TEXT PRIMARY KEY,
            timestamp INTEGER,
            platform TEXT,
            fileName TEXT,
            passed INTEGER
          );`
        );

        // Create issues table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS issues (
            id TEXT PRIMARY KEY,
            scanId TEXT,
            ruleId TEXT,
            title TEXT,
            description TEXT,
            severity TEXT,
            fix TEXT,
            documentationUrl TEXT,
            FOREIGN KEY(scanId) REFERENCES scans(id)
          );`
        );

        // Create compliance_rules table
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS compliance_rules (
            id TEXT PRIMARY KEY,
            platform TEXT,
            title TEXT,
            description TEXT,
            severity TEXT,
            checkType TEXT,
            path TEXT,
            fix TEXT,
            documentationUrl TEXT
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

export const saveScan = async (scan: ScanResult) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Insert scan
        tx.executeSql(
          `INSERT INTO scans (id, timestamp, platform, fileName, passed)
           VALUES (?, ?, ?, ?, ?);`,
          [scan.id, scan.timestamp, scan.platform, scan.fileName, scan.passed ? 1 : 0]
        );

        // Insert issues
        scan.issues.forEach((issue) => {
          tx.executeSql(
            `INSERT INTO issues (id, scanId, ruleId, title, description, severity, fix, documentationUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              issue.id,
              scan.id,
              issue.ruleId,
              issue.title,
              issue.description,
              issue.severity,
              issue.fix,
              issue.documentationUrl || null
            ]
          );
        });
      },
      (error) => {
        console.error('Failed to save scan:', error);
        reject(error);
      },
      () => {
        console.log('Scan saved successfully');
        resolve();
      }
    );
  });
};

export const getScans = async (limit?: number): Promise<ScanResult[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const query = limit
          ? 'SELECT * FROM scans ORDER BY timestamp DESC LIMIT ?'
          : 'SELECT * FROM scans ORDER BY timestamp DESC';

        tx.executeSql(
          query,
          limit ? [limit] : [],
          (_, { rows }) => {
            const scans: ScanResult[] = rows._array.map((row) => ({
              id: row.id,
              timestamp: row.timestamp,
              platform: row.platform,
              fileName: row.fileName,
              passed: row.passed === 1,
              issues: []
            }));

            // Get issues for each scan
            const scanIds = scans.map((scan) => scan.id);
            if (scanIds.length > 0) {
              tx.executeSql(
                `SELECT * FROM issues WHERE scanId IN (${scanIds.map(() => '?').join(',')})`,
                scanIds,
                (_, { rows: issueRows }) => {
                  const issuesMap: Record<string, ComplianceIssue[]> = {};

                  issueRows._array.forEach((issueRow) => {
                    if (!issuesMap[issueRow.scanId]) {
                      issuesMap[issueRow.scanId] = [];
                    }

                    issuesMap[issueRow.scanId].push({
                      id: issueRow.id,
                      ruleId: issueRow.ruleId,
                      title: issueRow.title,
                      description: issueRow.description,
                      severity: issueRow.severity as 'critical' | 'warning' | 'info',
                      fix: issueRow.fix,
                      documentationUrl: issueRow.documentationUrl || undefined
                    });
                  });

                  // Assign issues to scans
                  const scansWithIssues = scans.map((scan) => ({
                    ...scan,
                    issues: issuesMap[scan.id] || []
                  }));

                  resolve(scansWithIssues);
                },
                (_, error) => {
                  console.error('Failed to fetch issues:', error);
                  reject(error);
                }
              );
            } else {
              resolve(scans);
            }
          },
          (_, error) => {
            console.error('Failed to fetch scans:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getRules = async (platform?: 'ios' | 'android'): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        const query = platform
          ? 'SELECT * FROM compliance_rules WHERE platform = ?'
          : 'SELECT * FROM compliance_rules';

        tx.executeSql(
          query,
          platform ? [platform] : [],
          (_, { rows }) => {
            resolve(rows._array);
          },
          (_, error) => {
            console.error('Failed to fetch rules:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const seedRules = async (rules: any[]) => {
  return new Promise<void>((resolve, reject) => {
    db.transaction(
      (tx) => {
        // Clear existing rules
        tx.executeSql('DELETE FROM compliance_rules');

        // Insert new rules
        rules.forEach((rule) => {
          tx.executeSql(
            `INSERT INTO compliance_rules (id, platform, title, description, severity, checkType, path, fix, documentationUrl)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [
              rule.id,
              rule.platform,
              rule.title,
              rule.description,
              rule.severity,
              rule.checkType,
              rule.path,
              rule.fix,
              rule.documentationUrl || null
            ]
          );
        });
      },
      (error) => {
        console.error('Failed to seed rules:', error);
        reject(error);
      },
      () => {
        console.log('Rules seeded successfully');
        resolve();
      }
    );
  });
};
