from functools import wraps
from flask import request, jsonify, g

from . import config
from . import database

def admin_required(f):
    """Decorator to require an X-Admin-Token header for administrative access."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        admin_token = request.headers.get('X-Admin-Token')
        if not admin_token or admin_token != config.ADMIN_TOKEN:
            return jsonify({"error": "Unauthorized: Invalid or missing X-Admin-Token"}), 401
        return f(*args, **kwargs)
    return decorated_function

def agent_required(f):
    """Decorator to require an X-Agent-Token header for agent access."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        agent_token = request.headers.get('X-Agent-Token')
        if not agent_token:
            database.add_audit_log(None, request.headers.get('X-Target-URL', 'N/A'), False, "Missing X-Agent-Token")
            return jsonify({"error": "Unauthorized: Missing X-Agent-Token"}), 401

        agent = database.get_agent_by_token(agent_token)
        if not agent:
            database.add_audit_log(None, request.headers.get('X-Target-URL', 'N/A'), False, f"Invalid X-Agent-Token: {agent_token}")
            return jsonify({"error": "Unauthorized: Invalid X-Agent-Token"}), 401

        g.agent = agent # Store agent info in Flask's global context
        return f(*args, **kwargs)
    return decorated_function
