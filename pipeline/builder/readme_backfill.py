"""Backfill READMEs for existing prototypes that have stub/short READMEs."""
import asyncio
import os
import httpx
from idea_scout.config import DB_PATH, OMNIROUTE_BASE, CODER_MODEL
from idea_scout.db import IdeaDB
from builder.orchestrator import PROTOTYPES_DIR

README_PROMPT = """Write a README.md for this mobile app prototype.

App: {title}
Analysis: {analysis}

Spec (first 800 chars): {spec_snippet}

Files in project: {file_list}

Write a clear, concise README with:
1. App name as H1
2. One-line description
3. What it does (2-3 bullet points)
4. Monetization model (one line)
5. Tech stack (one line)
6. How to run: `npx expo start` (or equivalent based on the stack)

Keep it SHORT — under 40 lines. No filler. Markdown only, no code fences around the whole thing."""

MIN_README_SIZE = 300  # bytes — anything under this is a stub


async def backfill_readmes():
    db = IdeaDB(DB_PATH)
    updated = 0

    # Find all prototype dirs with short READMEs
    targets = []
    for dirname in sorted(os.listdir(PROTOTYPES_DIR)):
        if not dirname.startswith("idea-"):
            continue
        project_dir = os.path.join(PROTOTYPES_DIR, dirname)
        readme_path = os.path.join(project_dir, "README.md")
        spec_path = os.path.join(project_dir, "spec.md")

        readme_size = 0
        if os.path.exists(readme_path):
            readme_size = os.path.getsize(readme_path)

        if readme_size >= MIN_README_SIZE:
            continue

        # Extract idea ID from dirname: idea-{id}-{safe_name}
        parts = dirname.split("-", 2)  # ["idea", id_prefix, ...]
        # Try to find the idea in DB by matching directory prefix
        idea_id = None
        for prefix_len in [2, 3]:
            candidate = "-".join(parts[1:prefix_len + 1]) if prefix_len + 1 <= len(parts) else None
            if candidate:
                # Search DB for matching ID
                rows = db.conn.execute(
                    "SELECT id FROM posts WHERE id LIKE ?", (f"%{parts[1]}%",)
                ).fetchall()
                if rows:
                    idea_id = rows[0]["id"]
                    break

        if not idea_id:
            # Try harder — match on directory name pattern
            # dirname format: idea-{source}-{hash}-{safe_name}
            # e.g. idea-hn-47355049-tapteam or idea-web-abc123-appname
            possible_id = dirname.replace("idea-", "", 1).rsplit("-", 1)[0] if "-" in dirname else None
            if possible_id:
                row = db.conn.execute("SELECT id FROM posts WHERE id = ?", (possible_id,)).fetchone()
                if row:
                    idea_id = row["id"]

        spec = ""
        if os.path.exists(spec_path):
            with open(spec_path) as f:
                spec = f.read()

        # List files
        file_list = []
        for root, _, fnames in os.walk(project_dir):
            for fname in fnames:
                if fname.startswith(".") or "node_modules" in root or "__pycache__" in root:
                    continue
                rel = os.path.relpath(os.path.join(root, fname), project_dir)
                file_list.append(rel)

        idea = db.get_post(idea_id) if idea_id else None
        targets.append((project_dir, readme_path, idea, spec, file_list))

    print(f"Found {len(targets)} prototypes needing README backfill")

    async with httpx.AsyncClient(timeout=60) as client:
        for project_dir, readme_path, idea, spec, file_list in targets:
            title = idea["title"] if idea else os.path.basename(project_dir)
            analysis = (idea.get("analysis", "") or "") if idea else ""

            try:
                resp = await client.post(
                    f"{OMNIROUTE_BASE}/chat/completions",
                    json={
                        "model": CODER_MODEL,
                        "messages": [{"role": "user", "content": README_PROMPT.format(
                            title=title,
                            analysis=analysis[:500],
                            spec_snippet=spec[:800],
                            file_list=", ".join(file_list[:20]),
                        )}],
                        "temperature": 0.3,
                    },
                    timeout=60,
                )
                resp.raise_for_status()
                readme = resp.json()["choices"][0]["message"]["content"]
                with open(readme_path, "w") as f:
                    f.write(readme)
                print(f"  Updated: {os.path.basename(project_dir)} ({len(readme)} bytes)")
                updated += 1
                await asyncio.sleep(2)  # rate limit
            except Exception as e:
                print(f"  SKIP {os.path.basename(project_dir)}: {type(e).__name__}")

    if updated:
        import subprocess
        subprocess.run(["git", "add", "."], cwd=PROTOTYPES_DIR)
        subprocess.run(
            ["git", "commit", "-m", f"docs: backfill READMEs for {updated} prototypes"],
            cwd=PROTOTYPES_DIR,
        )
        subprocess.run(["git", "push"], cwd=PROTOTYPES_DIR)

    print(f"Done — updated {updated} READMEs")


if __name__ == "__main__":
    asyncio.run(backfill_readmes())
