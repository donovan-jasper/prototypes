import httpx
from idea_scout.config import OMNIROUTE_BASE, CODER_MODEL, UNSTUCK_MODEL


async def llm_call(client: httpx.AsyncClient, model: str, messages: list[dict], temperature: float = 0.3) -> str:
    resp = await client.post(
        f"{OMNIROUTE_BASE}/chat/completions",
        json={"model": model, "messages": messages, "temperature": temperature},
        timeout=300,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"]


async def generate_code(client: httpx.AsyncClient, spec: str) -> str:
    """Generate code from a spec using the coder combo."""
    messages = [
        {"role": "system", "content": (
            "You are a coding agent. Given a spec, output ALL files needed as a single response. "
            "Format each file as:\n```path/to/file.ext\n<contents>\n```\n"
            "Include a README.md with setup and run instructions. No commentary outside code blocks."
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
    """Extract file_path -> contents from fenced code blocks."""
    files = {}
    parts = response.split("```")
    for i in range(1, len(parts), 2):
        block = parts[i]
        first_line_end = block.index("\n")
        header = block[:first_line_end].strip()
        content = block[first_line_end + 1:]
        # Header should be a file path (contains / or .)
        if "/" in header or "." in header:
            # Strip language hint if present (e.g., "python src/app.py" -> "src/app.py")
            path = header.split()[-1] if " " in header else header
            # Strip "lang:" prefix (e.g., "json:package.json" -> "package.json")
            if ":" in path and not path.startswith("/"):
                after_colon = path.split(":", 1)[1]
                if "." in after_colon:
                    path = after_colon
            files[path] = content.rstrip("\n") + "\n"
    return files
