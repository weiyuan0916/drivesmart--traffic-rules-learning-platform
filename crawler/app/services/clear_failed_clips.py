#!/usr/bin/env python3
"""
Clear local_clip_path for challenges whose clips failed during the first run.
These are identified by:
  - local_clip_path IS NOT NULL (already set)
  - BUT the file does not exist on disk
"""
import sqlite3
from pathlib import Path

DB_PATH = Path("/Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform/crawler/data/dailydictation.db")
STORAGE_DIR = Path("/Users/edward/Documents/GitHub/drivesmart--traffic-rules-learning-platform/crawler/storage/audio_clips")


def main():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    rows = conn.execute("""
        SELECT id, local_clip_path
        FROM challenges
        WHERE local_clip_path IS NOT NULL AND local_clip_path != ''
    """).fetchall()

    missing = []
    for row in rows:
        path = Path(row["local_clip_path"])
        if not path.exists():
            missing.append(row["id"])

    print(f"Found {len(missing)} challenges with missing clip files")

    if missing:
        placeholders = ",".join("?" * len(missing))
        conn.execute(
            f"UPDATE challenges SET local_clip_path = NULL WHERE id IN ({placeholders})",
            missing,
        )
        conn.commit()
        print(f"Cleared {len(missing)} clip paths — they will be retried on next slicer run")
    else:
        print("No missing clips found")

    conn.close()


if __name__ == "__main__":
    main()
