from flask import Flask, request, jsonify, render_template, Response, stream_with_context, g
import json
from urllib.parse import urlparse, parse_qs
import requests

from secretswap import config, database, crypto, auth, proxy

app = Flask(__name__, static_folder='static', template_folder='templates')

# --- Web Dashboard ---
@app.route('/')
def dashboard():
    return render_template('dashboard.html')

# --- API Endpoints ---

# Secrets
@app.route('/api/secrets', methods=['GET'])
@auth.admin_required
def get_secrets():
    secrets = database.get_all_secrets()
    # For security, do not return actual credentials in API list view
    for secret in secrets:
        secret['credential'] = '********'
    return jsonify(secrets)

@app.route('/api/secrets', methods=['POST'])
@auth.admin_required
def create_secret():
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'placeholder_key', 'credential', 'service_type']):
        return jsonify({"error": "Missing data for name, placeholder_key, credential, or service_type"}), 400

    secret = database.create_secret(
        data['name'],
        data['placeholder_key'],
        data['credential'],
        data['service_type']
    )
    if secret:
        secret['credential'] = '********' # Mask credential for response
        return jsonify(secret), 201
    return jsonify({"error": "Secret with this name or placeholder key already exists"}), 409

@app.route('/api/secrets/<int:secret_id>', methods=['GET'])
@auth.admin_required
def get_secret_detail(secret_id):
    secret = database.get_secret(secret_id)
    if secret:
        secret['credential'] = '********' # Mask credential for response
        return jsonify(secret)
    return jsonify({"error": "Secret not found"}), 404

@app.route('/api/secrets/<int:secret_id>', methods=['PUT'])
@auth.admin_required
def update_secret(secret_id):
    data = request.get_json()
    if not data or not all(k in data for k in ['name', 'placeholder_key', 'credential', 'service_type']):
        return jsonify({"error": "Missing data for name, placeholder_key, credential, or service_type"}), 400

    secret = database.update_secret(
        secret_id,
        data['name'],
        data['placeholder_key'],
        data['credential'],
        data['service_type']
    )
    if secret:
        secret['credential'] = '********' # Mask credential for response
        return jsonify(secret)
    return jsonify({"error": "Secret not found or name/placeholder key already exists"}), 404

@app.route('/api/secrets/<int:secret_id>', methods=['DELETE'])
@auth.admin_required
def delete_secret(secret_id):
    if database.delete_secret(secret_id):
        return jsonify({"message": "Secret deleted successfully"}), 200
    return jsonify({"error": "Secret not found"}), 404

# Agents
@app.route('/api/agents', methods=['GET'])
@auth.admin_required
def get_agents():
    agents = database.get_all_agents()
    return jsonify(agents)

@app.route('/api/agents', methods=['POST'])
@auth.admin_required
def create_agent():
    data = request.get_json()
    if not data or 'name' not in data:
        return jsonify({"error": "Missing 'name' for agent"}), 400

    agent = database.create_agent(data['name'])
    if agent:
        return jsonify(agent), 201
    return jsonify({"error": "Agent with this name already exists"}), 409

# Audit Logs
@app.route('/api/logs', methods=['GET'])
@auth.admin_required
def get_logs():
    logs = database.get_all_audit_logs()
    return jsonify(logs)

# --- Proxy Gateway ---
@app.route('/proxy', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
@app.route('/proxy/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
@auth.agent_required
def proxy_gateway(path):
    target_url = request.headers.get('X-Target-URL')
    if not target_url:
        database.add_audit_log(g.agent['id'], 'N/A', False, "Missing X-Target-URL header")
        return jsonify({"error": "X-Target-URL header is required"}), 400

    # Extract query parameters from the incoming request
    query_params = request.args.to_dict()

    # Prepare headers for forwarding
    forward_headers = {k: v for k, v in request.headers if k.lower() not in ['host', 'x-forwarded-for', 'x-forwarded-host', 'x-forwarded-proto', 'x-agent-token', 'x-target-url']}

    # Get raw request body
    request_body = request.get_data()

    # Forward the request and get the response
    target_response, success = proxy.forward_request(
        method=request.method,
        target_url=target_url,
        headers=forward_headers,
        query_params=query_params,
        body=request_body,
        agent_id=g.agent['id']
    )

    if not success:
        return jsonify({"error": "Failed to forward request to target API"}), 500

    # Log audit entry for successful proxy request
    database.add_audit_log(g.agent['id'], target_url, True, f"Proxied {request.method} request to {target_url}")

    # Stream the response back to the client
    # Remove hop-by-hop headers from the target response
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    response_headers = [(name, value) for name, value in target_response.raw.headers.items()
                        if name.lower() not in excluded_headers]

    return Response(stream_with_context(target_response.iter_content(chunk_size=8192)),
                    status=target_response.status_code,
                    headers=response_headers)

if __name__ == '__main__':
    app.run(debug=True, port=config.FLASK_PORT)
