"""Re-analyze all ideas that lack feasibility scores."""
import asyncio
import json
import httpx
from idea_scout.db import IdeaDB
from idea_scout.config import DB_PATH, OMNIROUTE_BASE
from idea_scout.analyzer import build_analysis_prompt, parse_analysis_response

# Use groq for speed — the coder combo is too slow for batch work
FAST_MODEL = "groq/llama-3.3-70b-versatile"


async def reanalyze_all():
    db = IdeaDB(DB_PATH)

    rows = db.conn.execute(
        "SELECT * FROM posts WHERE viability_score IS NOT NULL AND feasibility_score IS NULL"
    ).fetchall()
    ideas = [dict(r) for r in rows]
    print(f"Re-analyzing {len(ideas)} ideas for feasibility scores...", flush=True)

    done = 0
    errors = 0
    consecutive_errors = 0
    async with httpx.AsyncClient(timeout=30) as client:
        for post in ideas:
            try:
                prompt = build_analysis_prompt(post)
                resp = await client.post(
                    f"{OMNIROUTE_BASE}/chat/completions",
                    json={
                        "model": FAST_MODEL,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.3,
                    },
                    timeout=30,
                )
                resp.raise_for_status()
                content = resp.json()["choices"][0]["message"]["content"]
                result = parse_analysis_response(content)
                db.save_analysis(
                    post["id"], result["analysis"],
                    result["viability_score"], result.get("feasibility_score")
                )
                feas = result.get("feasibility_score", "?")
                done += 1
                consecutive_errors = 0
                if done % 10 == 0:
                    print(f"  {done}/{len(ideas)} done...", flush=True)
                old_v = post.get("viability_score", 0)
                new_v = result["viability_score"]
                if abs(old_v - new_v) >= 2:
                    print(f"    Score changed {old_v}->{new_v} f={feas}: {post['title'][:40]}", flush=True)
                await asyncio.sleep(0.5)  # light rate limit
            except Exception as e:
                errors += 1
                consecutive_errors += 1
                if errors % 5 == 0:
                    print(f"  {errors} errors ({type(e).__name__}: {str(e)[:80]})", flush=True)
                backoff = min(60, 5 * (2 ** (consecutive_errors - 1)))
                await asyncio.sleep(backoff)

    print(f"\nDone: {done} re-analyzed, {errors} errors", flush=True)


if __name__ == "__main__":
    asyncio.run(reanalyze_all())
