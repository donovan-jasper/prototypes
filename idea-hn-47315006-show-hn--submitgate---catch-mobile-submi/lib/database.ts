import * as SQLite from 'expo-sqlite';
import { ScanResult, ComplianceRule } from './types';
import complianceRulesData from '../assets/compliance-rules.json';

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
            check TEXT,
            path TEXT,
            fix TEXT,
            documentationUrl TEXT
          );`
        );

        // Check if rules table is empty
        tx.executeSql(
          'SELECT COUNT(*) as count FROM compliance_rules;',
          [],
          (_, result) => {
            if (result.rows.item(0).count === 0) {
              // Seed the rules table
              const rules: ComplianceRule[] = [
                ...complianceRulesData.ios.map(rule => ({ ...rule, platform: 'ios' })),
                ...complianceRulesData.android.map(rule => ({ ...rule, platform: 'android' }))
              ];

              rules.forEach(rule => {
                tx.executeSql(
                  `INSERT INTO compliance_rules (
                    id, platform, title, description, severity, check, path, fix, documentationUrl
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                  [
                    rule.id,
                    rule.platform,
                    rule.title,
                    rule.description,
                    rule.severity,
                    rule.check,
                    rule.path || null,
                    rule.fix,
                    rule.documentationUrl || null
                  ]
                );
              });
            }
          }
        );
      },
      (error) => {
        console.error('Database initialization failed:', error);
        reject(error);
      },
      () => {
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
        scan.issues.forEach(issue => {
          tx.executeSql(
            `INSERT INTO issues (
              id, scanId, ruleId, title, description, severity, fix, documentationUrl
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
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
        resolve();
      }
    );
  });
};

export const getScans = async (): Promise<ScanResult[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM scans ORDER BY timestamp DESC;`,
          [],
          (_, { rows }) => {
            const scans: ScanResult[] = [];

            for (let i = 0; i < rows.length; i++) {
              const scan = rows.item(i);
              scans.push({
                id: scan.id,
                timestamp: scan.timestamp,
                platform: scan.platform,
                fileName: scan.fileName,
                passed: scan.passed === 1,
                issues: []
              });
            }

            // Get issues for each scan
            const promises = scans.map(scan => {
              return new Promise<void>((resolveIssues) => {
                tx.executeSql(
                  `SELECT * FROM issues WHERE scanId = ?;`,
                  [scan.id],
                  (_, { rows: issueRows }) => {
                    scan.issues = [];
                    for (let j = 0; j < issueRows.length; j++) {
                      const issue = issueRows.item(j);
                      scan.issues.push({
                        id: issue.id,
                        ruleId: issue.ruleId,
                        title: issue.title,
                        description: issue.description,
                        severity: issue.severity as 'critical' | 'warning' | 'info',
                        fix: issue.fix,
                        documentationUrl: issue.documentationUrl
                      });
                    }
                    resolveIssues();
                  }
                );
              });
            });

            Promise.all(promises).then(() => {
              resolve(scans);
            });
          },
          (_, error) => {
            console.error('Failed to get scans:', error);
            reject(error);
          }
        );
      }
    );
  });
};

export const getRules = async (platform: 'ios' | 'android'): Promise<ComplianceRule[]> => {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          `SELECT * FROM compliance_rules WHERE platform = ?;`,
          [platform],
          (_, { rows }) => {
            const rules: ComplianceRule[] = [];
            for (let i = 0; i < rows.length; i++) {
              const rule = rows.item(i);
              rules.push({
                id: rule.id,
                platform: rule.platform as 'ios' | 'android',
                title: rule.title,
                description: rule.description,
                severity: rule.severity as 'critical' | 'warning' | 'info',
                check: rule.check,
                path: rule.path,
                fix: rule.fix,
                documentationUrl: rule.documentationUrl
              });
            }
            resolve(rules);
          },
          (_, error) => {
            console.error('Failed to get rules:', error);
            reject(error);
          }
        );
      }
    );
  });
};
