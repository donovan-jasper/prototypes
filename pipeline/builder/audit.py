"""Audit how well AI evaluations matched actual build outcomes."""
import os
from idea_scout.db import IdeaDB
from idea_scout.config import DB_PATH

PROTOS = os.path.expanduser("~/prototypes")


def find_dir(idea_id):
    prefix = f"idea-{idea_id}"
    for d in os.listdir(PROTOS):
        if d.startswith(prefix):
            return os.path.join(PROTOS, d)
    return None


def count_files(proj_dir):
    total = 0
    has_app = False
    for root, _, fnames in os.walk(proj_dir):
        if "node_modules" in root or "__pycache__" in root:
            continue
        for f in fnames:
            if not f.startswith("."):
                total += 1
            if f in ("App.js", "App.tsx", "app.json", "package.json"):
                has_app = True
    return total, has_app


def audit():
    db = IdeaDB(DB_PATH)
    rows = db.conn.execute(
        "SELECT id, title, viability_score, competition_score, analysis "
        "FROM posts WHERE prototype_started = 1"
    ).fetchall()

    stubs = []
    runnable = []
    no_dir = []

    for r in rows:
        proj = find_dir(r["id"])
        if not proj:
            no_dir.append(r)
            continue
        fc, has_app = count_files(proj)
        analysis = r["analysis"] or ""
        diff_line = ""
        for line in analysis.split("\n"):
            if line.startswith("Difficulty:"):
                diff_line = line.split(":", 1)[1].strip()[:30]
        entry = {**dict(r), "files": fc, "has_app": has_app, "difficulty": diff_line}
        if fc <= 2:
            stubs.append(entry)
        else:
            runnable.append(entry)

    total = len(rows)
    print("=== EVALUATION QUALITY AUDIT ===\n")
    print(f"Total built: {total}")
    print(f"  Runnable (real code): {len(runnable)} ({len(runnable)*100//total}%)")
    print(f"  Stubs (<=2 files):    {len(stubs)} ({len(stubs)*100//total}%)")
    print(f"  No directory:         {len(no_dir)}")

    # Score vs outcome
    for label, min_s, max_s in [("Score 8+", 8, 10), ("Score 7", 7, 7)]:
        r = [x for x in runnable if min_s <= (x["viability_score"] or 0) <= max_s]
        s = [x for x in stubs if min_s <= (x["viability_score"] or 0) <= max_s]
        t = len(r) + len(s)
        pct = len(s) * 100 // t if t else 0
        print(f"  {label}: {len(r)} runnable, {len(s)} stubs ({pct}% stub rate)")

    # Difficulty vs outcome
    print("\nDifficulty vs outcome:")
    for diff in ["Hard", "Medium"]:
        r = [x for x in runnable if diff.lower() in x["difficulty"].lower()]
        s = [x for x in stubs if diff.lower() in x["difficulty"].lower()]
        t = len(r) + len(s)
        pct = len(s) * 100 // t if t else 0
        print(f"  {diff}: {len(r)} runnable, {len(s)} stubs ({pct}% stub rate)")

    # Competition score vs outcome
    print("\nCompetition score vs outcome:")
    for label, lo, hi in [("comp 8-10", 8, 10), ("comp 5-7", 5, 7), ("comp 1-4", 1, 4)]:
        r = [x for x in runnable if lo <= (x["competition_score"] or 0) <= hi]
        s = [x for x in stubs if lo <= (x["competition_score"] or 0) <= hi]
        t = len(r) + len(s)
        pct = len(s) * 100 // t if t else 0
        print(f"  {label}: {len(r)} runnable, {len(s)} stubs ({pct}% stub rate)")

    # Most notable stubs — high score but failed to build
    print("\n=== HIGH-SCORE STUBS (should have built but didn't) ===")
    for s in sorted(stubs, key=lambda x: -(x["viability_score"] or 0))[:10]:
        print(f"  v={s['viability_score']} c={s['competition_score']} | {s['difficulty']:30s} | {s['title'][:40]}")

    # Notable successes — runnable with most files
    print("\n=== BEST BUILDS (most complete prototypes) ===")
    for r in sorted(runnable, key=lambda x: -x["files"])[:10]:
        print(f"  v={r['viability_score']} c={r['competition_score']} | {r['files']:3d} files | {r['title'][:40]}")


if __name__ == "__main__":
    audit()
