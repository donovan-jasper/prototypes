import sqlite3
import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional

from . import config
from . import crypto

def get_db_connection():
    """Establishes a connection to the SQLite database."""
    os.makedirs(os.path.dirname(config.DATABASE_PATH), exist_ok=True)
    conn = sqlite3.connect(config.DATABASE_PATH)
    conn.row_factory = sqlite3.Row  # This allows accessing columns by name
    return conn

def init_db():
    """Initializes the database schema."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # Secrets table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS secrets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            placeholder_key TEXT NOT NULL UNIQUE,
            credential TEXT NOT NULL, -- Stored encrypted
            service_type TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Agents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS agents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            token TEXT NOT NULL UNIQUE, -- UUID for agent authentication
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Audit logs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            agent_id INTEGER,
            target_api TEXT NOT NULL,
            success BOOLEAN NOT NULL,
            message TEXT,
            FOREIGN KEY (agent_id) REFERENCES agents (id)
        )
    ''')

    conn.commit()
    conn.close()

# --- Secret Management ---

def create_secret(name: str, placeholder_key: str, credential: str, service_type: str) -> Optional[Dict]:
    """Creates a new secret, encrypting the credential."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        encrypted_credential = crypto.encrypt(credential, config.MASTER_KEY)
        cursor.execute(
            "INSERT INTO secrets (name, placeholder_key, credential, service_type) VALUES (?, ?, ?, ?)",
            (name, placeholder_key, encrypted_credential, service_type)
        )
        conn.commit()
        return get_secret(cursor.lastrowid)
    except sqlite3.IntegrityError:
        return None # Name or placeholder_key already exists
    finally:
        conn.close()

def get_secret(secret_id: int) -> Optional[Dict]:
    """Retrieves a secret by ID, decrypting the credential."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM secrets WHERE id = ?", (secret_id,))
    secret = cursor.fetchone()
    conn.close()
    if secret:
        secret_dict = dict(secret)
        secret_dict['credential'] = crypto.decrypt(secret_dict['credential'], config.MASTER_KEY)
        return secret_dict
    return None

def get_secret_by_placeholder(placeholder_key: str) -> Optional[Dict]:
    """Retrieves a secret by its placeholder key, decrypting the credential."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM secrets WHERE placeholder_key = ?", (placeholder_key,))
    secret = cursor.fetchone()
    conn.close()
    if secret:
        secret_dict = dict(secret)
        secret_dict['credential'] = crypto.decrypt(secret_dict['credential'], config.MASTER_KEY)
        return secret_dict
    return None

def get_all_secrets() -> List[Dict]:
    """Retrieves all secrets, decrypting credentials."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM secrets")
    secrets = cursor.fetchall()
    conn.close()
    decrypted_secrets = []
    for secret in secrets:
        secret_dict = dict(secret)
        secret_dict['credential'] = crypto.decrypt(secret_dict['credential'], config.MASTER_KEY)
        decrypted_secrets.append(secret_dict)
    return decrypted_secrets

def update_secret(secret_id: int, name: str, placeholder_key: str, credential: str, service_type: str) -> Optional[Dict]:
    """Updates an existing secret, encrypting the credential."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        encrypted_credential = crypto.encrypt(credential, config.MASTER_KEY)
        cursor.execute(
            "UPDATE secrets SET name = ?, placeholder_key = ?, credential = ?, service_type = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            (name, placeholder_key, encrypted_credential, service_type, secret_id)
        )
        conn.commit()
        if cursor.rowcount == 0:
            return None # Secret not found
        return get_secret(secret_id)
    except sqlite3.IntegrityError:
        return None # Name or placeholder_key already exists
    finally:
        conn.close()

def delete_secret(secret_id: int) -> bool:
    """Deletes a secret by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM secrets WHERE id = ?", (secret_id,))
    conn.commit()
    conn.close()
    return cursor.rowcount > 0

# --- Agent Management ---

def create_agent(name: str) -> Optional[Dict]:
    """Creates a new agent with a unique token."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        token = str(uuid.uuid4())
        cursor.execute(
            "INSERT INTO agents (name, token) VALUES (?, ?)",
            (name, token)
        )
        conn.commit()
        return get_agent(cursor.lastrowid)
    except sqlite3.IntegrityError:
        return None # Agent name already exists
    finally:
        conn.close()

def get_agent(agent_id: int) -> Optional[Dict]:
    """Retrieves an agent by ID."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents WHERE id = ?", (agent_id,))
    agent = cursor.fetchone()
    conn.close()
    return dict(agent) if agent else None

def get_agent_by_token(token: str) -> Optional[Dict]:
    """Retrieves an agent by their token."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents WHERE token = ?", (token,))
    agent = cursor.fetchone()
    conn.close()
    return dict(agent) if agent else None

def get_all_agents() -> List[Dict]:
    """Retrieves all agents."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agents")
    agents = cursor.fetchall()
    conn.close()
    return [dict(agent) for agent in agents]

# --- Audit Log Management ---

def add_audit_log(agent_id: Optional[int], target_api: str, success: bool, message: Optional[str] = None):
    """Adds an entry to the audit log."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO audit_logs (agent_id, target_api, success, message) VALUES (?, ?, ?, ?)",
        (agent_id, target_api, success, message)
    )
    conn.commit()
    conn.close()

def get_all_audit_logs() -> List[Dict]:
    """Retrieves all audit logs, ordered by timestamp."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT al.*, a.name AS agent_name
        FROM audit_logs al
        LEFT JOIN agents a ON al.agent_id = a.id
        ORDER BY al.timestamp DESC
    ''')
    logs = cursor.fetchall()
    conn.close()
    return [dict(log) for log in logs]
