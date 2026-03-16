import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'voiceforge.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const setupDatabase = () => {
    db.exec(`
        CREATE TABLE IF NOT EXISTS workflows (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS provider_configs (
            id TEXT PRIMARY KEY,
            provider_name TEXT NOT NULL UNIQUE,
            api_key TEXT NOT NULL,
            config TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            workflow_id TEXT,
            status TEXT,
            started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            ended_at DATETIME,
            metadata TEXT,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id)
        );
    `);
    console.log('Database tables checked/created.');
};

setupDatabase();

// Helper functions for workflows
export const getWorkflows = () => {
    return db.prepare('SELECT id, name, created_at, updated_at FROM workflows ORDER BY updated_at DESC').all();
};

export const getWorkflowById = (id) => {
    return db.prepare('SELECT * FROM workflows WHERE id = ?').get(id);
};

export const createWorkflow = (id, name, data) => {
    const stmt = db.prepare('INSERT INTO workflows (id, name, data) VALUES (?, ?, ?)');
    stmt.run(id, name, JSON.stringify(data));
    return getWorkflowById(id);
};

export const updateWorkflow = (id, name, data) => {
    const stmt = db.prepare('UPDATE workflows SET name = ?, data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(name, JSON.stringify(data), id);
    return getWorkflowById(id);
};

export const deleteWorkflow = (id) => {
    const stmt = db.prepare('DELETE FROM workflows WHERE id = ?');
    stmt.run(id);
    return { message: 'Workflow deleted' };
};

// Helper functions for provider configs
export const getProviderConfigs = () => {
    // Do not return API keys directly for security reasons in a real app.
    // For this prototype, we'll return a sanitized version.
    return db.prepare('SELECT id, provider_name, config FROM provider_configs').all().map(p => ({
        ...p,
        config: p.config ? JSON.parse(p.config) : {}
    }));
};

export const getProviderConfigByName = (name) => {
    const config = db.prepare('SELECT * FROM provider_configs WHERE provider_name = ?').get(name);
    if (config) {
        return {
            ...config,
            config: config.config ? JSON.parse(config.config) : {}
        };
    }
    return null;
};

export const saveProviderConfig = (id, provider_name, api_key, config) => {
    const existing = getProviderConfigByName(provider_name);
    if (existing) {
        const stmt = db.prepare('UPDATE provider_configs SET api_key = ?, config = ?, updated_at = CURRENT_TIMESTAMP WHERE provider_name = ?');
        stmt.run(api_key, JSON.stringify(config), provider_name);
    } else {
        const stmt = db.prepare('INSERT INTO provider_configs (id, provider_name, api_key, config) VALUES (?, ?, ?, ?)');
        stmt.run(id, provider_name, api_key, JSON.stringify(config));
    }
    return getProviderConfigByName(provider_name);
};

export const deleteProviderConfig = (name) => {
    const stmt = db.prepare('DELETE FROM provider_configs WHERE provider_name = ?');
    stmt.run(name);
    return { message: 'Provider config deleted' };
};

// Helper functions for sessions
export const createSession = (id, workflow_id, status = 'started', metadata = {}) => {
    const stmt = db.prepare('INSERT INTO sessions (id, workflow_id, status, metadata) VALUES (?, ?, ?, ?)');
    stmt.run(id, workflow_id, status, JSON.stringify(metadata));
    return { id, workflow_id, status, metadata };
};

export const updateSessionStatus = (id, status, metadata = {}) => {
    const stmt = db.prepare('UPDATE sessions SET status = ?, metadata = ?, ended_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(status, JSON.stringify(metadata), id);
    return { id, status, metadata };
};

export default db;
