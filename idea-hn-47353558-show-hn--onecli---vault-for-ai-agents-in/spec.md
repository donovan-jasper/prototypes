# OneCLI Implementation Specification

## 1. App Name
**SecretSwap**

## 2. One-line Pitch
A lightweight proxy gateway that lets AI agents make API calls using placeholder tokens that get swapped for real credentials at runtime, keeping secrets out of prompts and logs.

## 3. Tech Stack
- **Backend**: Python 3.11+ with Flask
- **Database**: SQLite with encryption (sqlcipher)
- **Encryption**: cryptography library (Fernet symmetric encryption)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Proxy**: requests library with custom middleware
- **Auth**: Simple API key authentication

## 4. Core Features

### Feature 1: Credential Vault Management
- Store API credentials encrypted at rest with a master key
- CRUD operations for secrets via REST API
- Each secret has: name, placeholder key (e.g., `{{OPENAI_KEY}}`), actual credential, service type

### Feature 2: Proxy Gateway
- HTTP proxy endpoint that intercepts requests from AI agents
- Automatically detects placeholder keys in headers, query params, and request bodies
- Swaps placeholders with real credentials before forwarding to target API
- Returns responses without exposing actual credentials

### Feature 3: Agent Access Control
- Generate unique agent tokens for different AI systems
- Track which agents can access which secrets
- Basic audit logging of proxy requests (timestamp, agent, target API, success/failure)

### Feature 4: Simple Web Dashboard
- View and manage stored secrets
- Generate agent access tokens
- View recent proxy activity logs
- Copy placeholder keys for use in AI prompts

## 5. File Structure

```
secretswap/
├── app.py                      # Main Flask application
├── config.py                   # Configuration and environment variables
├── requirements.txt            # Python dependencies
├── database.py                 # Database models and operations
├── crypto.py                   # Encryption/decryption utilities
├── proxy.py                    # Proxy logic and placeholder swapping
├── auth.py                     # Authentication middleware
├── init_db.py                  # Database initialization script
├── static/
│   ├── style.css              # Dashboard styles
│   └── app.js                 # Dashboard JavaScript
├── templates/
│   └── dashboard.html         # Web dashboard
├── data/
│   └── secretswap.db          # SQLite database (created at runtime)
└── README.md                  # Setup and usage instructions
```

## 6. Implementation Steps

### Step 1: Project Setup
Create `requirements.txt`:
```
Flask==3.0.0
cryptography==41.0.7
requests==2.31.0
python-dotenv==1.0.0
```

Create `config.py`:
- Define `MASTER_KEY` environment variable (32-byte base64 encoded key)
- Define `ADMIN_TOKEN` for dashboard access
- Define `DATABASE_PATH` defaulting to `data/secretswap.db`
- Define `PROXY_PORT` default