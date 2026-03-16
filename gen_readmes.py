"""Generate/regenerate READMEs for all prototypes using DB data. No LLM needed."""
import os
import sqlite3
import re

DB_PATH = os.path.expanduser("~/prototypes/pipeline/ideas.db")
PROTO_DIR = os.path.expanduser("~/prototypes")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row


def parse_analysis(analysis):
    lines = analysis.split("\n")
    summary = lines[0] if lines else ""
    parts = {}
    for line in lines[1:]:
        if ":" in line:
            k = line.split(":")[0].strip()
            v = ":".join(line.split(":")[1:]).strip()
            if v:
                parts[k] = v
    return summary, parts


def detect_stack(project_dir):
    """Check project dir and subdirs for tech stack markers."""
    for root in [project_dir] + [
        os.path.join(project_dir, d) for d in os.listdir(project_dir)
        if os.path.isdir(os.path.join(project_dir, d))
    ]:
        if os.path.exists(os.path.join(root, "app.json")):
            return "React Native (Expo)", "npx expo start"
        if os.path.exists(os.path.join(root, "package.json")):
            return "Node.js", "npm install && npm start"
        if os.path.exists(os.path.join(root, "requirements.txt")):
            return "Python", "pip install -r requirements.txt && python app.py"
    return "React Native (Expo)", "npx expo start"


def extract_features_from_spec(spec_text, max_features=4):
    """Pull bullet-point features from spec."""
    features = []
    in_features = False
    for line in spec_text.split("\n"):
        lower = line.lower().strip()
        if "feature" in lower or "core" in lower:
            in_features = True
            continue
        if in_features and line.strip().startswith(("-", "*")):
            feat = line.strip().lstrip("-* ").strip()
            if feat and len(feat) > 5:
                features.append(feat[:100])
                if len(features) >= max_features:
                    break
        elif in_features and line.strip().startswith("#"):
            break
    return features


def find_idea(dirname):
    """Extract idea ID from dirname and look up in DB."""
    for pat in [
        re.search(r"idea-(hn-\d+)", dirname),
        re.search(r"idea-(web-[a-f0-9]+)", dirname),
    ]:
        if pat:
            row = conn.execute(
                "SELECT * FROM posts WHERE id = ?", (pat.group(1),)
            ).fetchone()
            if row:
                return dict(row)
    return None


def generate_readme(idea, project_dir):
    analysis = idea.get("analysis") or ""
    summary, parts = parse_analysis(analysis)
    if not summary:
        summary = idea["title"]

    audience = parts.get("Audience", "")
    monetization = parts.get("Monetization", "")
    gap = parts.get("Gap", "")
    mobile_fit = parts.get("Mobile fit", "")
    difficulty = parts.get("Difficulty", "")
    score = idea.get("viability_score", "?")
    comp_score = idea.get("competition_score")

    stack, run_cmd = detect_stack(project_dir)

    # Read spec for feature extraction
    spec_path = os.path.join(project_dir, "spec.md")
    features = []
    if os.path.exists(spec_path):
        with open(spec_path) as f:
            features = extract_features_from_spec(f.read()[:2000])

    if not features:
        features = [summary[:100]]
        if mobile_fit:
            features.append(mobile_fit[:100])

    # Build README
    lines = [
        f"# {idea['title']}",
        "",
        f"> {summary[:200]}",
        "",
    ]

    if gap:
        lines.append(f"**Gap:** {gap[:150]}")
        lines.append("")

    lines.append("## Features")
    lines.append("")
    for f in features:
        lines.append(f"- {f}")

    lines.extend([
        "",
        "## Details",
        "",
        "| | |",
        "|---|---|",
        f"| **Score** | {score}/10 |",
    ])
    if comp_score is not None:
        lines.append(f"| **Competition** | {comp_score}/10 |")
    if monetization:
        lines.append(f"| **Monetization** | {monetization[:120]} |")
    if audience:
        lines.append(f"| **Audience** | {audience[:120]} |")
    lines.append(f"| **Stack** | {stack} |")
    if difficulty:
        lines.append(f"| **Difficulty** | {difficulty[:80]} |")

    lines.extend([
        "",
        "## Run",
        "",
        "```bash",
        run_cmd,
        "```",
    ])

    return "\n".join(lines) + "\n"


generated = 0
regenerated = 0
for dirname in sorted(os.listdir(PROTO_DIR)):
    if not dirname.startswith("idea-"):
        continue
    project_dir = os.path.join(PROTO_DIR, dirname)
    if not os.path.isdir(project_dir):
        continue

    idea = find_idea(dirname)
    if not idea:
        continue

    readme_path = os.path.join(project_dir, "README.md")
    readme = generate_readme(idea, project_dir)

    # Write new or overwrite existing (all get refreshed)
    existed = os.path.exists(readme_path)
    with open(readme_path, "w") as f:
        f.write(readme)

    if existed:
        regenerated += 1
    else:
        generated += 1
    print(f"  {'REGEN' if existed else 'NEW  '}: {idea['title'][:50]}")

print(f"\nDone: {generated} new, {regenerated} regenerated")
