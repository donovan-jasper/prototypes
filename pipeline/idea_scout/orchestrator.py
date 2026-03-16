import asyncio
import os
import subprocess
import httpx
from idea_scout.config import DB_PATH, NTFY_TOPIC
from idea_scout.db import IdeaDB
from .spec_writer import generate_spec
from .code_builder import generate_code, fix_with_unstuck, parse_code_blocks


PROTOTYPES_DIR = os.path.expanduser("~/prototypes")
UV_BIN = os.path.expanduser("~/.local/bin/uv")
MAX_UNSTUCK_RETRIES = 2


def write_files(project_dir: str, files: dict[str, str]):
    for path, content in files.items():
        full_path = os.path.join(project_dir, path)
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content)


def try_install_and_test(project_dir: str) -> tuple[bool, str]:
    """Try to install deps and run tests. Returns (success, error_output)."""
    # Check for requirements.txt or package.json
    req_txt = os.path.join(project_dir, "requirements.txt")
    pkg_json = os.path.join(project_dir, "package.json")

    if os.path.exists(req_txt):
        r = subprocess.run(
            [UV_BIN, "pip", "install", "-r", "requirements.txt", "--python", "python3"],
            cwd=project_dir, capture_output=True, text=True, timeout=120,
        )
        if r.returncode != 0:
            return False, f"pip install failed:\n{r.stderr}"
    elif os.path.exists(pkg_json):
        r = subprocess.run(
            ["npm", "install"], cwd=project_dir,
            capture_output=True, text=True, timeout=120,
        )
        if r.returncode != 0:
            return False, f"npm install failed:\n{r.stderr}"

    # Try running tests if they exist
    test_dir = os.path.join(project_dir, "tests")
    test_file = os.path.join(project_dir, "test_app.py")
    if os.path.isdir(test_dir) or os.path.exists(test_file):
        r = subprocess.run(
            ["python3", "-m", "pytest", "-x", "--tb=short"],
            cwd=project_dir, capture_output=True, text=True, timeout=60,
        )
        if r.returncode != 0:
            return False, f"Tests failed:\n{r.stdout}\n{r.stderr}"

    # Syntax check all .py files
    for root, _, fnames in os.walk(project_dir):
        for fname in fnames:
            if fname.endswith(".py"):
                fpath = os.path.join(root, fname)
                r = subprocess.run(
                    ["python3", "-c", f"import ast; ast.parse(open('{fpath}').read())"],
                    capture_output=True, text=True, timeout=10,
                )
                if r.returncode != 0:
                    return False, f"Syntax error in {fname}:\n{r.stderr}"

    return True, ""


async def build_next_prototype():
    db = IdeaDB(DB_PATH)
    ideas = db.get_unbuilt_top_ideas(min_score=7, limit=1)

    if not ideas:
        print("No unbuilt ideas with score >= 7")
        return

    idea = ideas[0]
    print(f"Building prototype for: {idea['title']}")
    db.mark_prototype_started(idea["id"])

    # Step 1: Generate spec (planner model)
    print("  [planner] Generating spec...")
    spec = await generate_spec(idea)

    # Step 2: Generate code (coder model)
    async with httpx.AsyncClient(timeout=300) as client:
        print("  [coder] Generating code...")
        code_response = await generate_code(client, spec)
        files = parse_code_blocks(code_response)

        # Create project directory
        safe_name = "".join(
            c if c.isalnum() or c in "-_" else "-"
            for c in idea["title"].lower()
        )[:40].strip("-")
        project_dir = os.path.join(PROTOTYPES_DIR, f"idea-{idea['id']}-{safe_name}")
        os.makedirs(project_dir, exist_ok=True)

        # Write spec
        with open(os.path.join(project_dir, "spec.md"), "w") as f:
            f.write(spec)

        # Write generated code
        write_files(project_dir, files)
        print(f"  Wrote {len(files)} files")

        # Step 3: Validate and escalate if needed
        success, error = try_install_and_test(project_dir)
        retries = 0
        while not success and retries < MAX_UNSTUCK_RETRIES:
            retries += 1
            print(f"  [unstuck] Attempt {retries}/{MAX_UNSTUCK_RETRIES}: {error[:100]}")
            fixed_response = await fix_with_unstuck(client, spec, code_response, error)
            fixed_files = parse_code_blocks(fixed_response)
            if fixed_files:
                write_files(project_dir, fixed_files)
                code_response = fixed_response
                print(f"  Rewrote {len(fixed_files)} files")
            success, error = try_install_and_test(project_dir)

        status = "working" if success else f"needs-fix (after {retries} unstuck attempts)"
        print(f"  Status: {status}")

    # Commit and push
    subprocess.run(["git", "add", "."], cwd=PROTOTYPES_DIR)
    subprocess.run(
        ["git", "commit", "-m", f"feat: prototype for {safe_name} [{status}]"],
        cwd=PROTOTYPES_DIR,
    )
    subprocess.run(["git", "push"], cwd=PROTOTYPES_DIR)

    # Notify
    analysis = idea.get("analysis", "") or ""
    parts = {line.split(":")[0].strip(): ":".join(line.split(":")[1:]).strip()
             for line in analysis.split("\n") if ":" in line}
    summary = analysis.split("\n")[0] if analysis else idea["title"]
    monetization = parts.get("Monetization", parts.get("$", ""))
    gap = parts.get("Gap", "")
    ntfy_title = f"Built: {idea['title'][:40]}".encode("ascii", errors="replace").decode()
    body = f"{summary}\n\nScore: {idea['viability_score']}/10 | Status: {status} | {len(files)} files"
    if gap:
        body += f"\nGap: {gap[:100]}"
    if monetization:
        body += f"\n$: {monetization[:100]}"
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            content=body.encode("utf-8"),
            headers={
                "Title": ntfy_title,
                "Priority": "high" if success else "default",
                "Tags": "white_check_mark,iphone" if success else "warning",
            },
        )

    print(f"Done: {project_dir}")


def main():
    asyncio.run(build_next_prototype())


if __name__ == "__main__":
    main()
