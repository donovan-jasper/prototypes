#!/usr/bin/env python3
"""Generate README.md files for prototype dirs that lack one."""

import os
import glob
import json
import urllib.request
import subprocess
import sys
import time

PROTO_DIR = os.path.expanduser("~/prototypes")
API_URL = "http://localhost:20128/v1/chat/completions"
MODEL = "coder"

SOURCE_EXTS = {
    ".py", ".js", ".ts", ".tsx", ".jsx", ".html", ".css",
    ".go", ".rs", ".java", ".rb", ".sh", ".yaml", ".yml",
    ".toml", ".json", ".svelte", ".vue", ".c", ".cpp", ".h",
    ".swift", ".kt", ".dart", ".lua", ".zig", ".ex", ".exs",
}
SKIP_DIRS = {"node_modules", ".git", "__pycache__", ".venv", "venv", "dist", "build", ".next"}


def find_missing_readmes():
    dirs = sorted(glob.glob(os.path.join(PROTO_DIR, "idea-*")))
    return [d for d in dirs if os.path.isdir(d) and not os.path.isfile(os.path.join(d, "README.md"))]


def read_file_safe(path, max_chars=6000):
    try:
        with open(path, "r", errors="replace") as f:
            return f.read()[:max_chars]
    except Exception:
        return ""


def gather_context(proto_dir):
    spec_path = os.path.join(proto_dir, "spec.md")
    if os.path.isfile(spec_path):
        content = read_file_safe(spec_path, max_chars=12000)
        if content.strip():
            return f"=== spec.md ===\n{content}"

    collected = []
    total_chars = 0
    max_total = 15000
    for root, dirnames, filenames in os.walk(proto_dir):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fname in sorted(filenames):
            ext = os.path.splitext(fname)[1].lower()
            if ext in SOURCE_EXTS or fname in ("Dockerfile", "Makefile", "Cargo.toml", "package.json", "pyproject.toml"):
                fpath = os.path.join(root, fname)
                relpath = os.path.relpath(fpath, proto_dir)
                content = read_file_safe(fpath, max_chars=4000)
                if content.strip():
                    chunk = f"=== {relpath} ===\n{content}\n"
                    collected.append(chunk)
                    total_chars += len(chunk)
                    if total_chars >= max_total:
                        break
        if total_chars >= max_total:
            break

    return "\n".join(collected) if collected else ""


def call_coder(context, dirname, max_retries=5):
    prompt = f"""You are generating a README.md for a software prototype. Keep it SHORT (under 40 lines of markdown).

Format:
- H1: App name (infer from the directory name or spec)
- One-line description
- ## Features: 2-3 bullet points
- ## Monetization: one sentence about the business model (infer from context; if unclear, say "TBD")
- ## Tech Stack: bullet list of key technologies
- ## Running: brief instructions (1-3 lines)
- ## Status: one line, e.g. "Prototype" or "MVP"

Directory name: {dirname}

Context from the project:
{context}

Generate ONLY the README.md content, nothing else. No code fences around it."""

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 1500,
    }
    data = json.dumps(payload).encode("utf-8")

    for attempt in range(max_retries):
        req = urllib.request.Request(
            API_URL,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"].strip()
        except urllib.error.HTTPError as e:
            if e.code in (406, 429, 503) and attempt < max_retries - 1:
                wait = 15 * (attempt + 1)
                print(f"  HTTP {e.code}, retrying in {wait}s (attempt {attempt+1}/{max_retries})...")
                time.sleep(wait)
            else:
                print(f"  API error: {e}", file=sys.stderr)
                return None
        except Exception as e:
            print(f"  API error: {e}", file=sys.stderr)
            return None


def main():
    missing = find_missing_readmes()
    print(f"Found {len(missing)} prototype dirs missing README.md")
    if not missing:
        print("Nothing to do.")
        return

    generated = []
    for i, proto_dir in enumerate(missing):
        dirname = os.path.basename(proto_dir)
        print(f"\n[{i+1}/{len(missing)}] Processing: {dirname}")

        context = gather_context(proto_dir)
        if not context.strip():
            print(f"  Skipping (no spec or source files found)")
            continue

        readme_content = call_coder(context, dirname)
        if not readme_content:
            print(f"  Skipping (API call failed)")
            continue

        readme_path = os.path.join(proto_dir, "README.md")
        with open(readme_path, "w") as f:
            f.write(readme_content + "\n")
        print(f"  Wrote README.md ({len(readme_content)} chars)")
        generated.append(readme_path)

        # Small delay between requests to avoid hitting rate limits
        time.sleep(2)

    print(f"\n--- Generated {len(generated)} README files ---")

    if generated:
        print("\nCommitting and pushing...")
        os.chdir(PROTO_DIR)
        subprocess.run(["git", "add"] + [os.path.relpath(p, PROTO_DIR) for p in generated], check=True)
        subprocess.run(["git", "commit", "-m", "Add generated README.md files for prototypes missing them"], check=True)
        subprocess.run(["git", "push"], check=True)
        print("Done. Pushed successfully.")


if __name__ == "__main__":
    main()
