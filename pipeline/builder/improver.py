import json
import os
import subprocess
import httpx
from idea_scout.config import (
    OMNIROUTE_BASE, PLANNER_MODEL, CODER_MODEL, UNSTUCK_MODEL,
    DB_PATH, NTFY_TOPIC,
)
from idea_scout.db import IdeaDB
from builder.code_builder import llm_call, parse_code_blocks
from builder.orchestrator import write_files, try_install_and_test, PROTOTYPES_DIR

ASSESS_PROMPT = """You are reviewing an existing prototype app. Read the spec and code below.

## Spec
{spec}

## Current Files
{file_listing}

Pick the SINGLE highest-impact improvement from this list:
1. Add a compelling feature that differentiates this from competitors
2. Add AI integration via an OpenAI-compatible API at http://localhost:20128/v1 (model: "coder")
3. Improve the UI — better CSS, responsive layout, nicer design
4. Add or improve tests
5. Better README with clear setup/run instructions

Return JSON:
{{
  "improvement": "one sentence describing what to do",
  "category": "feature|ai|ui|tests|docs",
  "files_to_change": ["list of file paths to create or modify"]
}}

Only JSON, no commentary."""

IMPLEMENT_PROMPT = """Implement this improvement to an existing prototype.

## Improvement
{improvement}

## Current Spec
{spec}

## Current Files
{file_listing}

Output the COMPLETE updated files (not diffs). Format each as:
```path/to/file.ext
<full contents>
```

Only output files that changed or are new. No commentary outside code blocks."""


def _read_project_files(project_dir: str) -> str:
    """Read all text files in a project directory into a listing."""
    parts = []
    for root, _, fnames in os.walk(project_dir):
        for fname in fnames:
            if fname.startswith(".") or "__pycache__" in root or "node_modules" in root:
                continue
            fpath = os.path.join(root, fname)
            rel = os.path.relpath(fpath, project_dir)
            try:
                with open(fpath) as f:
                    content = f.read()
                if len(content) < 10000:
                    parts.append(f"### {rel}\n```\n{content}\n```")
            except (UnicodeDecodeError, PermissionError):
                continue
    return "\n\n".join(parts)


def _find_project_dir(idea: dict) -> str | None:
    """Find the project directory for a given idea."""
    prefix = f"idea-{idea['id']}"
    try:
        for d in os.listdir(PROTOTYPES_DIR):
            if d.startswith(prefix):
                return os.path.join(PROTOTYPES_DIR, d)
    except FileNotFoundError:
        pass
    return None


async def improve_prototype(idea: dict) -> bool:
    """Run one improvement cycle on an existing prototype. Returns True if successful."""
    db = IdeaDB(DB_PATH)
    project_dir = _find_project_dir(idea)
    if not project_dir:
        print(f"  Cannot find project dir for {idea['id']}")
        return False

    spec_path = os.path.join(project_dir, "spec.md")
    spec = ""
    if os.path.exists(spec_path):
        with open(spec_path) as f:
            spec = f.read()

    file_listing = _read_project_files(project_dir)
    if not file_listing:
        print(f"  Empty project dir: {project_dir}")
        return False

    async with httpx.AsyncClient(timeout=300) as client:
        # Step 1: Assess — planner picks improvement
        print("  [planner] Assessing prototype...")
        assess_response = await llm_call(
            client, PLANNER_MODEL,
            [{"role": "user", "content": ASSESS_PROMPT.format(spec=spec, file_listing=file_listing)}],
        )
        try:
            cleaned = assess_response.strip()
            if "```" in cleaned:
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
                cleaned = cleaned.strip()
            assessment = json.loads(cleaned)
        except (json.JSONDecodeError, ValueError):
            print(f"  Failed to parse assessment: {assess_response[:100]}")
            return False

        improvement = assessment.get("improvement", "")
        print(f"  [planner] Improvement: {improvement}")

        # Step 2: Implement — coder does the work
        print("  [coder] Implementing...")
        impl_response = await llm_call(
            client, CODER_MODEL,
            [{"role": "user", "content": IMPLEMENT_PROMPT.format(
                improvement=improvement, spec=spec, file_listing=file_listing
            )}],
            temperature=0.2,
        )
        files = parse_code_blocks(impl_response)
        if not files:
            print("  No files generated")
            return False
        write_files(project_dir, files)
        print(f"  Wrote {len(files)} files")

        # Step 3: Validate
        success, error = try_install_and_test(project_dir)
        if not success:
            print(f"  [unstuck] Fixing: {error[:80]}")
            fix_response = await llm_call(
                client, UNSTUCK_MODEL,
                [{"role": "user", "content": (
                    f"## Improvement attempted\n{improvement}\n\n"
                    f"## Files changed\n{impl_response}\n\n"
                    f"## Error\n{error}\n\n"
                    "Fix the code. Output COMPLETE corrected files as ```path\\ncontents``` blocks."
                )}],
                temperature=0.2,
            )
            fixed_files = parse_code_blocks(fix_response)
            if fixed_files:
                write_files(project_dir, fixed_files)
            success, error = try_install_and_test(project_dir)

        status = "improved" if success else "attempted"
        print(f"  Status: {status}")

        # Commit
        subprocess.run(["git", "add", "."], cwd=PROTOTYPES_DIR)
        subprocess.run(
            ["git", "commit", "-m", f"improve: {improvement[:60]} [{status}]"],
            cwd=PROTOTYPES_DIR,
        )
        subprocess.run(["git", "push"], cwd=PROTOTYPES_DIR)

        db.record_improvement(idea["id"])

        # Notify
        analysis = idea.get("analysis", "") or ""
        summary = analysis.split("\n")[0] if analysis else idea["title"]
        await client.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            content=f"{summary}\n\nImprovement: {improvement}\nStatus: {status}".encode(),
            headers={"Title": f"Improved: {idea['title'][:60]}", "Tags": "sparkles"},
        )

    return success
