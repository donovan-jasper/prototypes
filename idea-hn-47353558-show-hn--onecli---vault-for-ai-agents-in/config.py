import os
from dotenv import load_dotenv

load_dotenv()

# --- Core Configuration ---
MASTER_KEY = os.getenv("MASTER_KEY")
if not MASTER_KEY:
    raise ValueError("MASTER_KEY environment variable not set. Generate one using: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())'")

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")
if not ADMIN_TOKEN:
    raise ValueError("ADMIN_TOKEN environment variable not set. Please set a secure admin token.")

# --- Database Configuration ---
DATABASE_PATH = os.getenv("DATABASE_PATH", "data/secretswap.db")

# --- Server Configuration ---
FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))

# --- Proxy Configuration ---
# Placeholder format for secrets
PLACEHOLDER_PREFIX = "{{"
PLACEHOLDER_SUFFIX = "}}"
