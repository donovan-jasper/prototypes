import sqlite3
from utils import load_json, save_json

DATABASE = 'contextguard.db'

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS compressed_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expanded_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def store_compressed_content(content):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO compressed_content (content) VALUES (?)', (str(content),))
    conn.commit()
    conn.close()

def get_compressed_content(content_id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT content FROM compressed_content WHERE id = ?', (content_id,))
    content = cursor.fetchone()[0]
    conn.close()
    return content

def store_expanded_content(content):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('INSERT INTO expanded_content (content) VALUES (?)', (str(content),))
    conn.commit()
    conn.close()

def get_expanded_content(content_id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT content FROM expanded_content WHERE id = ?', (content_id,))
    content = cursor.fetchone()[0]
    conn.close()
    return content
