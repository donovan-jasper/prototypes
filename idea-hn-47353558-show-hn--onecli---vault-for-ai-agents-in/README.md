# SecretSwap

A lightweight proxy gateway that lets AI agents make API calls using placeholder tokens that get swapped for real credentials at runtime, keeping secrets out of prompts and logs.

## Features

*   **Credential Vault Management**: Store API credentials encrypted at rest with a master key. CRUD operations via REST API and web dashboard.
*   **Proxy Gateway**: Intercepts requests, detects placeholder keys (e.g., `{{OPENAI_KEY}}`), swaps them for real credentials, and forwards to the target API.
*   **Agent Access Control**: Generate unique agent tokens, track access, and log proxy requests.
*   **Simple Web Dashboard**: Manage secrets, generate agent tokens, and view activity logs.

## Tech Stack

*   **Backend**: Python 3.11+ with Flask
*   **Database**: SQLite (data fields encrypted using `cryptography`)
*   **Encryption**: `cryptography` library (Fernet symmetric encryption)
*   **Frontend**: Vanilla HTML/CSS/JavaScript
*   **Proxy**: `requests` library
*   **Auth**: Simple API key authentication

## Setup

### 1. Clone the repository
