import asyncio
import os
import subprocess
import httpx
from idea_scout.config import DB_PATH, NTFY_TOPIC
from idea_scout.db import IdeaDB
from .spec_writer import generate_spec


PROTOTYPES_DIR = os.path.expanduser("~/prototypes")


async def build_next_prototype():
    db = IdeaDB(DB_PATH)
    ideas = db.get_unbuilt_top_ideas(min_score=7, limit=1)

    if not ideas:
        print("No unbuilt ideas with score >= 7")
        return

    idea = ideas[0]
    print(f"Building prototype for: {idea['title']}")
    db.mark_prototype_started(idea["id"])

    # Generate spec
    spec = await generate_spec(idea)

    # Create project directory
    safe_name = "".join(
        c if c.isalnum() or c in "-_" else "-"
        for c in idea["title"].lower()
    )[:40].strip("-")
    project_dir = os.path.join(PROTOTYPES_DIR, f"idea-{idea['id']}-{safe_name}")
    os.makedirs(project_dir, exist_ok=True)

    # Write spec
    spec_path = os.path.join(project_dir, "spec.md")
    with open(spec_path, "w") as f:
        f.write(spec)

    # Commit and push
    subprocess.run(["git", "add", "."], cwd=PROTOTYPES_DIR)
    subprocess.run(
        ["git", "commit", "-m", f"feat: spec for {safe_name}"],
        cwd=PROTOTYPES_DIR,
    )
    subprocess.run(["git", "push"], cwd=PROTOTYPES_DIR)

    # Notify
    async with httpx.AsyncClient() as client:
        await client.post(
            f"https://ntfy.sh/{NTFY_TOPIC}",
            content=(
                f"New prototype spec generated:\n"
                f"{idea['title']}\n"
                f"Score: {idea['viability_score']}/10\n"
                f"Dir: {project_dir}"
            ).encode(),
            headers={
                "Title": "New Prototype Spec Ready",
                "Priority": "high",
                "Tags": "hammer_and_wrench",
            },
        )

    print(f"Spec written to {spec_path}")


def main():
    asyncio.run(build_next_prototype())


if __name__ == "__main__":
    main()
