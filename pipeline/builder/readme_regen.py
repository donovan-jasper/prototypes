"""Regenerate all prototype READMEs from DB data. No LLM calls needed."""
import os
import subprocess
from idea_scout.config import DB_PATH
from idea_scout.db import IdeaDB
from builder.orchestrator import PROTOTYPES_DIR


def _parse_analysis(analysis: str) -> tuple[str, dict]:
    lines = analysis.split("\n")
    summary = lines[0] if lines else ""
    parts = {}
    for line in lines[1:]:
        if ":" in line:
            key = line.split(":")[0].strip()
            val = ":".join(line.split(":")[1:]).strip()
            if val:
                parts[key] = val
    return summary, parts


def _get_spec_app_name(spec_path: str) -> str:
    if not os.path.exists(spec_path):
        return ""
    with open(spec_path) as f:
        for line in f:
            if line.strip().startswith("# "):
                return line.strip()[2:].strip()
    return ""


def regen_all():
    db = IdeaDB(DB_PATH)
    updated = 0

    for dirname in sorted(os.listdir(PROTOTYPES_DIR)):
        if not dirname.startswith("idea-"):
            continue
        project_dir = os.path.join(PROTOTYPES_DIR, dirname)
        spec_path = os.path.join(project_dir, "spec.md")
        readme_path = os.path.join(project_dir, "README.md")

        # Find idea in DB
        idea = None
        parts = dirname.split("-")
        if len(parts) >= 3:
            if parts[1] == "hn":
                idea = db.get_post(f"hn-{parts[2]}")
            elif parts[1] == "web":
                idea = db.get_post(f"web-{parts[2]}")

        if not idea:
            continue

        analysis = idea.get("analysis", "") or ""
        if not analysis:
            continue

        summary, fields = _parse_analysis(analysis)
        app_name = _get_spec_app_name(spec_path) or idea.get("title", "App")
        monetization = fields.get("Monetization", "")
        audience = fields.get("Audience", "")
        gap = fields.get("Gap", "")
        mobile_fit = fields.get("Mobile fit", "")
        difficulty = fields.get("Difficulty", "")
        score = idea.get("viability_score")
        comp_score = idea.get("competition_score")
        source_url = idea.get("source_url") or idea.get("permalink", "")

        # Build README from structured data — no LLM needed
        lines = [f"# {app_name}", ""]
        lines.append(summary)
        lines.append("")

        if audience:
            lines.append(f"**Who it's for:** {audience}")
            lines.append("")

        if gap:
            lines.append(f"**Gap:** {gap}")
            lines.append("")

        if monetization:
            lines.append(f"**Monetization:** {monetization}")
            lines.append("")

        score_parts = []
        if score:
            score_parts.append(f"Viability: {score}/10")
        if comp_score:
            score_parts.append(f"Competition: {comp_score}/10")
        if difficulty:
            score_parts.append(f"Difficulty: {difficulty}")
        if score_parts:
            lines.append(f"**{' | '.join(score_parts)}**")
            lines.append("")

        lines.append("## Run")
        lines.append("")
        lines.append("```bash")
        lines.append("npx expo start")
        lines.append("```")

        if source_url:
            lines.append("")
            lines.append("## Origin")
            lines.append("")
            lines.append(f"Inspired by: {source_url}")

        lines.append("")

        with open(readme_path, "w") as f:
            f.write("\n".join(lines))
        updated += 1

    print(f"Regenerated {updated} READMEs")

    if updated:
        subprocess.run(["git", "add", "."], cwd=PROTOTYPES_DIR)
        subprocess.run(
            ["git", "commit", "-m", f"docs: regenerate {updated} READMEs from analysis data"],
            cwd=PROTOTYPES_DIR,
        )
        subprocess.run(["git", "push"], cwd=PROTOTYPES_DIR)


if __name__ == "__main__":
    regen_all()
