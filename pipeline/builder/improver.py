import json
import os
import subprocess
import httpx
from idea_scout.config import (
    OMNIROUTE_BASE, PLANNER_MODEL, CODER_MODEL, UNSTUCK_MODEL,
    DB_PATH,
)
from idea_scout.db import IdeaDB
from idea_scout.notify import notify_improvement
from builder.code_builder import llm_call, parse_code_blocks
from builder.orchestrator import write_files, try_install_and_test, PROTOTYPES_DIR

ASSESS_PROMPT = """You are a senior React Native developer reviewing a mobile app prototype. Read the spec and code carefully.

## Spec
{spec}

## Current Files
{file_listing}

Analyze the code critically. What is the BIGGEST GAP between what the spec promises and what the code actually does?

Common problems in prototypes (check for these):
- Screens that render placeholder text instead of real UI components
- Functions that return hardcoded data instead of computing results
- Navigation that doesn't work or is missing
- State management that doesn't persist
- Core features from the spec that have no implementation at all
- Screens with no interactivity (no buttons, inputs, or user actions)

Pick the ONE improvement that would make the biggest difference to a user actually trying the app. Do NOT suggest:
- "AI-powered" anything unless the spec specifically calls for it
- Generic "premium features" — be specific about what the feature does
- Vague enhancements like "improve UX" — say exactly what to build

Return JSON:
{{
  "problem": "what's wrong or missing right now (be specific, reference file names)",
  "improvement": "exactly what to build, with enough detail that a developer could implement it",
  "category": "missing-feature|broken-logic|placeholder-code|no-persistence|ui-incomplete",
  "files_to_change": ["list of file paths to create or modify"]
}}

Only JSON, no commentary."""

IMPLEMENT_PROMPT = """You are implementing a specific improvement to a React Native (Expo) prototype.

## What to build
{improvement}

## Current Spec
{spec}

## Current Code
{file_listing}

IMPORTANT:
- Write REAL, WORKING code — not placeholder components or TODO comments
- If a screen needs UI, build actual interactive components with proper state
- If a feature needs data, implement real logic (calculations, filtering, sorting)
- Use proper React Native components (FlatList, TextInput, TouchableOpacity, etc.)
- Style things properly — consistent colors, spacing, readable text
- If you're fixing a screen, make sure it actually DOES something when the user taps buttons

Output the COMPLETE updated files (not diffs). Format each as:
```path/to/file.ext
<full contents>
```

Only output files that changed or are new. No commentary outside code blocks."""


def _read_project_files(project_dir: str, only_files: list[str] | None = None, max_total_chars: int = 40000) -> str:
    """Read text files in a project directory into a listing.

    If only_files is given, only those paths (relative to project_dir) are included.
    Stops adding files once max_total_chars is reached.
    """
    parts = []
    total = 0

    if only_files:
        candidates = [(os.path.join(project_dir, p), p) for p in only_files]
    else:
        candidates = []
        for root, _, fnames in os.walk(project_dir):
            for fname in sorted(fnames):
                if fname.startswith(".") or "__pycache__" in root or "node_modules" in root:
                    continue
                fpath = os.path.join(root, fname)
                rel = os.path.relpath(fpath, project_dir)
                candidates.append((fpath, rel))

    for fpath, rel in candidates:
        try:
            with open(fpath) as f:
                content = f.read()
        except (UnicodeDecodeError, PermissionError, FileNotFoundError):
            continue
        if len(content) >= 5000:
            content = content[:5000] + "\n... (truncated)"

        entry = f"### {rel}\n```\n{content}\n```"
        if total + len(entry) > max_total_chars:
            parts.append("### (truncated — remaining files omitted to stay within context)")
            break
        parts.append(entry)
        total += len(entry)
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
        print(f"  Cannot find project dir for {idea['id']}, skipping permanently")
        db.record_improvement(idea["id"])  # bump count so daemon moves on
        return False

    spec_path = os.path.join(project_dir, "spec.md")
    spec = ""
    if os.path.exists(spec_path):
        with open(spec_path) as f:
            spec = f.read()

    file_listing = _read_project_files(project_dir, max_total_chars=20000)
    if not file_listing:
        print(f"  Empty project dir: {project_dir}, skipping permanently")
        db.record_improvement(idea["id"])
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
        files_to_change = assessment.get("files_to_change", [])
        impl_listing = _read_project_files(project_dir, only_files=files_to_change) if files_to_change else file_listing
        impl_response = await llm_call(
            client, CODER_MODEL,
            [{"role": "user", "content": IMPLEMENT_PROMPT.format(
                improvement=improvement, spec=spec, file_listing=impl_listing
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
        round_num = idea.get("improvement_count", 0) + 1
        await notify_improvement(idea, improvement, status, round_num)

    return success
