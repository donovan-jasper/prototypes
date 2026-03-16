import requests
import json
from urllib.parse import urlparse, parse_qs, urlencode
from typing import Dict, Any, Tuple, Optional

from . import config
from . import database

def swap_placeholders(data: Any, secrets: Dict[str, str]) -> Any:
    """
    Recursively swaps placeholder keys in data (string, dict, list) with actual secrets.
    Placeholders are expected in the format {{PLACEHOLDER_KEY}}.
    """
    if isinstance(data, str):
        for placeholder_key, credential in secrets.items():
            full_placeholder = f"{config.PLACEHOLDER_PREFIX}{placeholder_key}{config.PLACEHOLDER_SUFFIX}"
            if full_placeholder in data:
                data = data.replace(full_placeholder, credential)
        return data
    elif isinstance(data, dict):
        return {k: swap_placeholders(v, secrets) for k, v in data.items()}
    elif isinstance(data, list):
        return [swap_placeholders(elem, secrets) for elem in data]
    else:
        return data

def forward_request(
    method: str,
    target_url: str,
    headers: Dict[str, str],
    query_params: Dict[str, str],
    body: Optional[Any],
    agent_id: int
) -> Tuple[requests.Response, bool]:
    """
    Forwards an incoming request to the target_url after swapping placeholders.
    Returns the response from the target API and a success boolean.
    """
    agent_secrets_list = database.get_all_secrets() # For this prototype, all secrets are available to all agents.
                                                    # In a real app, this would be filtered by agent_id.
    agent_secrets_map = {s['placeholder_key']: s['credential'] for s in agent_secrets_list}

    # 1. Swap placeholders in headers
    processed_headers = swap_placeholders(headers, agent_secrets_map)
    # Remove proxy-specific headers before forwarding
    processed_headers.pop('X-Agent-Token', None)
    processed_headers.pop('X-Target-URL', None)

    # 2. Swap placeholders in query parameters
    processed_query_params = swap_placeholders(query_params, agent_secrets_map)

    # 3. Swap placeholders in body
    processed_body = None
    if body:
        content_type = headers.get('Content-Type', '').lower()
        if 'application/json' in content_type:
            try:
                json_body = json.loads(body)
                processed_body = json.dumps(swap_placeholders(json_body, agent_secrets_map))
            except json.JSONDecodeError:
                processed_body = body # Malformed JSON, send as is
        elif 'application/x-www-form-urlencoded' in content_type:
            parsed_body = parse_qs(body.decode('utf-8'))
            processed_body = urlencode(swap_placeholders(parsed_body, agent_secrets_map), doseq=True)
        else:
            processed_body = body # For other content types (e.g., text, binary), send as is

    try:
        response = requests.request(
            method=method,
            url=target_url,
            headers=processed_headers,
            params=processed_query_params,
            data=processed_body,
            stream=True # Stream response to handle large files efficiently
        )
        return response, True
    except requests.exceptions.RequestException as e:
        database.add_audit_log(agent_id, target_url, False, f"Proxy request failed: {e}")
        return None, False
