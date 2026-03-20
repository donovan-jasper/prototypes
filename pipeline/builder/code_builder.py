import asyncio
import httpx
from idea_scout.config import OMNIROUTE_BASE, CODER_MODEL, UNSTUCK_MODEL

MAX_429_RETRIES = 4
RETRY_DELAYS = [30, 60, 90, 120]


async def llm_call(client: httpx.AsyncClient, model: str, messages: list[dict], temperature: float = 0.3) -> str:
    """Make an LLM call with retry on 429. ReadTimeout/disconnect propagate immediately
    so the daemon can restart OmniRoute quickly."""
    for attempt in range(MAX_429_RETRIES):
        try:
            resp = await client.post(
                f"{OMNIROUTE_BASE}/chat/completions",
                json={"model": model, "messages": messages, "temperature": temperature},
                timeout=60,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (429, 503) and attempt < MAX_429_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                print(f"    [llm] {e.response.status_code}, waiting {delay}s (attempt {attempt + 1}/{MAX_429_RETRIES})")
                await asyncio.sleep(delay)
                continue
            raise


async def generate_code(client: httpx.AsyncClient, spec: str) -> str:
    """Generate code from a spec using the coder combo."""
    messages = [
        {"role": "system", "content": (
            "You are a coding agent. Given a spec, output ALL source code files needed as a single response. "
            "Format each file as:\n```path/to/file.ext\n<contents>\n```\n"
            "Do NOT include a README.md — one will be generated separately. No commentary outside code blocks."
        )},
        {"role": "user", "content": f"Build this prototype:\n\n{spec}"},
    ]
    return await llm_call(client, CODER_MODEL, messages, temperature=0.2)


async def fix_with_unstuck(client: httpx.AsyncClient, spec: str, code: str, error: str) -> str:
    """Escalate to the unstuck (stronger) model to diagnose and fix errors."""
    messages = [
        {"role": "system", "content": (
            "You are a senior debugging agent. A junior coder generated code from a spec but it has errors. "
            "Diagnose the issue and output the COMPLETE corrected files. "
            "Format each file as:\n```path/to/file.ext\n<contents>\n```\n"
            "No commentary outside code blocks."
        )},
        {"role": "user", "content": (
            f"## Spec\n{spec}\n\n"
            f"## Generated Code\n{code}\n\n"
            f"## Error\n{error}\n\n"
            "Fix the code so it works."
        )},
    ]
    return await llm_call(client, UNSTUCK_MODEL, messages, temperature=0.2)


def parse_code_blocks(response: str) -> dict[str, str]:
    """Extract file_path -> contents from fenced code blocks.

    Handles multiple header formats:
      ```path/to/file.js      (path in header)
      ```javascript            (language only — fall back to first comment line)
    """
    import re

    files = {}
    parts = response.split("```")
    for i in range(1, len(parts), 2):
        block = parts[i]
        try:
            first_line_end = block.index("\n")
        except ValueError:
            continue
        header = block[:first_line_end].strip()
        content = block[first_line_end + 1:]

        path = None
        if "/" in header or "." in header:
            # Header contains a path directly
            path = header.split()[-1] if " " in header else header
            # Strip "lang:" prefix (e.g., "json:package.json" -> "package.json")
            if ":" in path and not path.startswith("/"):
                after_colon = path.split(":", 1)[1]
                if "." in after_colon:
                    path = after_colon
        else:
            # Header is a language tag — look for file path in first comment line
            # Matches: "// src/file.js", "# file.py", "/* file.css */", "<!-- file.html -->"
            first_content_line = content.split("\n")[0].strip()
            m = re.match(r'^(?://|#|/\*|<!--)\s*([\w./-]+\.[\w]+)', first_content_line)
            if m:
                path = m.group(1)
                # Strip the comment line from content
                content = content[content.index("\n") + 1:]

        if path:
            files[path] = content.rstrip("\n") + "\n"
    return files
