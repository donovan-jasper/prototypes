import asyncio
import httpx
from idea_scout.config import OMNIROUTE_BASE, CODER_MODEL, UNSTUCK_MODEL

MAX_RETRIES = 3
RETRY_DELAYS = [30, 60, 120]


async def llm_call(client: httpx.AsyncClient, model: str, messages: list[dict], temperature: float = 0.3) -> str:
    """Make an LLM call with retry on transient errors only.

    503 (transient) — retry with backoff.
    429/406 (all providers exhausted) — propagate immediately to daemon for backoff.
    ReadTimeout/disconnect — propagate immediately so daemon can restart OmniRoute.
    """
    for attempt in range(MAX_RETRIES):
        try:
            resp = await client.post(
                f"{OMNIROUTE_BASE}/chat/completions",
                json={"model": model, "messages": messages, "temperature": temperature},
                timeout=120,
            )
            resp.raise_for_status()
            return resp.json()["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            # Only retry 503 (transient) — 429/406 mean all providers are down
            if e.response.status_code == 503 and attempt < MAX_RETRIES - 1:
                delay = RETRY_DELAYS[attempt]
                print(f"    [llm] 503, waiting {delay}s (attempt {attempt + 1}/{MAX_RETRIES})")
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
      ```path/to/file.js        (path in header)
      ### path/to/file.js\n```  (markdown heading before block)
      ```javascript              (language only — fall back to first comment line)
    """
    import re

    files = {}
    # Pre-split lines to enable markdown-heading lookahead
    lines = response.split("\n")
    # Rebuild text but track which fenced blocks are preceded by a heading
    heading_for_block: dict[int, str] = {}  # char offset of ``` -> heading path
    char_pos = 0
    for idx, line in enumerate(lines):
        stripped = line.strip()
        if stripped.startswith("```") and idx > 0:
            prev = lines[idx - 1].strip()
            m = re.match(r'^#{1,4}\s+([\w./-]+\.[\w]+)', prev)
            if m:
                heading_for_block[char_pos] = m.group(1)
        char_pos += len(line) + 1  # +1 for the \n

    parts = response.split("```")
    char_offset = 0
    for i, part in enumerate(parts):
        if i % 2 == 1:  # inside a fenced block
            fence_start = char_offset - 3  # position of the opening ```
            try:
                first_line_end = part.index("\n")
            except ValueError:
                char_offset += len(part) + 3
                continue
            header = part[:first_line_end].strip()
            content = part[first_line_end + 1:]

            path = None
            if "/" in header or "." in header:
                # Path is in the fence header
                path = header.split()[-1] if " " in header else header
                if ":" in path and not path.startswith("/"):
                    after_colon = path.split(":", 1)[1]
                    if "." in after_colon:
                        path = after_colon
            elif fence_start in heading_for_block:
                # Markdown heading on the line before this block
                path = heading_for_block[fence_start]
            else:
                # Language-only header — look for path in first comment line
                first_content_line = content.split("\n")[0].strip()
                m = re.match(r'^(?://|#|/\*|<!--)\s*([\w./-]+\.[\w]+)', first_content_line)
                if m:
                    path = m.group(1)
                    content = content[content.index("\n") + 1:]

            if path:
                files[path] = content.rstrip("\n") + "\n"
        char_offset += len(part) + 3  # +3 for the ``` delimiter
    return files
