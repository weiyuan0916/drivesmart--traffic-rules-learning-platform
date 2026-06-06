#!/usr/bin/env python3
"""
Audio Clip Slicer
Cắt audio gốc (full lesson) thành từng clip theo timeStart/timeEnd của mỗi challenge (sentence).
Dùng ffmpeg để cắt nhanh và chính xác.

Usage:
    python3 slice_audio.py              # Cắt tất cả
    python3 slice_audio.py --lesson 1   # Chỉ cắt lesson 1
    python3 slice_audio.py --dry-run     # Xem trước không cắt thật
    python3 slice_audio.py --limit 5    # Giới hạn 5 lessons để test
"""

import argparse
import json
import os
import sqlite3
import subprocess
import sys
from pathlib import Path
from typing import Optional

# Paths
# audio_slicer.py -> app/services/ -> app/ -> crawler/
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
DB_PATH = PROJECT_ROOT / "data" / "dailydictation.db"
STORAGE_DIR = PROJECT_ROOT / "storage" / "audio_clips"
FFMPEG_BIN = "/opt/homebrew/bin/ffmpeg"

# Fallback ffmpeg locations
FFMPEG_FALLBACKS = [
    "/opt/homebrew/bin/ffmpeg",
    "/usr/local/bin/ffmpeg",
    "/usr/bin/ffmpeg",
    "ffmpeg",
]


def find_ffmpeg() -> str:
    """Tìm ffmpeg binary."""
    for path in FFMPEG_FALLBACKS:
        if os.path.isfile(path) and os.access(path, os.X_OK):
            return path
        result = subprocess.run(["which", path], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip()
    raise RuntimeError("ffmpeg not found. Install with: brew install ffmpeg")


def get_db() -> sqlite3.Connection:
    """Kết nối database (read-write để update local_clip_path)."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def get_lessons_with_audio(conn: sqlite3.Connection) -> list[sqlite3.Row]:
    """Lấy tất cả lessons có local audio file."""
    rows = conn.execute("""
        SELECT id, name, lesson_name, local_audio_path, audio_downloaded
        FROM lessons
        WHERE local_audio_path IS NOT NULL
          AND local_audio_path != ''
          AND audio_downloaded = 1
        ORDER BY id
    """).fetchall()
    return rows


def get_challenges_for_lesson(conn: sqlite3.Connection, lesson_id: int) -> list[sqlite3.Row]:
    """Lấy tất cả challenges của một lesson, có timeStart/timeEnd."""
    rows = conn.execute("""
        SELECT id, lesson_id, position, content, audio_src, time_start, time_end, local_clip_path
        FROM challenges
        WHERE lesson_id = ?
          AND time_start IS NOT NULL
          AND time_end IS NOT NULL
          AND (local_clip_path IS NULL OR local_clip_path = '')
        ORDER BY position
    """, (lesson_id,)).fetchall()
    return rows


def get_clip_output_path(lesson_id: int, challenge_position: int) -> Path:
    """Tạo đường dẫn output cho clip."""
    clip_dir = STORAGE_DIR / str(lesson_id)
    clip_dir.mkdir(parents=True, exist_ok=True)
    return clip_dir / f"clip_{challenge_position:03d}.mp3"


def slice_audio(
    input_path: str,
    output_path: Path,
    time_start: float,
    time_end: float,
    dry_run: bool = False,
) -> bool:
    """
    Cắt một đoạn audio từ input_path tại time_start đến time_end.
    duration = time_end - time_start
    """
    if not os.path.exists(input_path):
        return False

    if dry_run:
        print(f"  [DRY] {output_path} ({time_start:.2f}s -> {time_end:.2f}s, duration={time_end - time_start:.2f}s)")
        return True

    output_path.parent.mkdir(parents=True, exist_ok=True)

    duration = max(0.1, time_end - time_start)  # At least 0.1s

    cmd = [
        FFMPEG_BIN,
        "-y",                        # Overwrite output
        "-ss", str(time_start),      # Start time
        "-i", input_path,            # Input file
        "-t", str(duration),         # Duration
        "-af", "aformat=sample_fmts=s16:sample_rates=44100:channel_layouts=stereo",
                                      # Normalize to interleaved PCM (fixes
                                      # "inadequate AVFrame plane padding" errors
                                      # from libmp3lame with non-standard sources)
        "-acodec", "libmp3lame",     # MP3 codec
        "-b:a", "128k",              # Bitrate
        "-loglevel", "error",        # Only errors
        str(output_path),
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode == 0 and output_path.exists():
            return True
        else:
            print(f"  [ERROR] ffmpeg failed: {result.stderr.strip()}")
            return False
    except subprocess.TimeoutExpired:
        print(f"  [ERROR] Timeout slicing {output_path}")
        return False
    except Exception as e:
        print(f"  [ERROR] {e}")
        return False


def process_lesson(
    lesson: sqlite3.Row,
    conn: sqlite3.Connection,
    dry_run: bool = False,
    verbose: bool = False,
) -> tuple[int, int, int]:
    """
    Process one lesson: cắt tất cả challenges của nó.
    Returns: (total, succeeded, failed)
    """
    lesson_id = lesson["id"]
    lesson_name = lesson["lesson_name"] or lesson["name"]
    input_path = lesson["local_audio_path"]

    challenges = get_challenges_for_lesson(conn, lesson_id)

    if not challenges:
        return 0, 0, 0

    succeeded = 0
    failed = 0

    if verbose:
        print(f"\nLesson {lesson_id}: {lesson_name} ({len(challenges)} challenges)")
        print(f"  Source: {input_path}")

    for ch in challenges:
        ch_id = ch["id"]
        position = ch["position"]
        content = ch["content"]
        time_start = float(ch["time_start"])
        time_end = float(ch["time_end"])

        output_path = get_clip_output_path(lesson_id, position)

        if verbose:
            preview = content[:50] + ("..." if len(content) > 50 else "")
            print(f"  [{position}] {time_start:.2f}s -> {time_end:.2f}s: {preview}")

        ok = slice_audio(input_path, output_path, time_start, time_end, dry_run)

        if ok:
            if not dry_run:
                conn.execute(
                    "UPDATE challenges SET local_clip_path = ? WHERE id = ?",
                    (str(output_path), ch_id),
                )
            succeeded += 1
            if verbose:
                if output_path.exists():
                    size = output_path.stat().st_size
                    print(f"  -> Saved: {output_path.name} ({size:,} bytes)")
                else:
                    print(f"  -> Saved: {output_path.name} (dry run)")
        else:
            failed += 1

    if succeeded > 0 and not dry_run:
        conn.commit()

    return len(challenges), succeeded, failed


def main():
    parser = argparse.ArgumentParser(description="Slice full lesson audio into per-sentence clips")
    parser.add_argument("--lesson", type=int, default=None, help="Process specific lesson ID only")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of lessons to process")
    parser.add_argument("--dry-run", action="store_true", help="Preview without actually slicing")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--force", action="store_true", help="Re-process even if clip already exists")
    args = parser.parse_args()

    ffmpeg_path = find_ffmpeg()
    print(f"FFmpeg: {ffmpeg_path}")
    print(f"DB: {DB_PATH}")
    print(f"Output: {STORAGE_DIR}")

    if args.dry_run:
        print("\n[DRY RUN MODE - No files will be created]")

    # If --force, clear existing local_clip_path entries first
    if args.force:
        conn = get_db()
        count = conn.execute("UPDATE challenges SET local_clip_path = NULL WHERE local_clip_path IS NOT NULL").rowcount
        conn.commit()
        conn.close()
        print(f"[FORCE] Cleared {count} existing clip paths")

    STORAGE_DIR.mkdir(parents=True, exist_ok=True)

    conn = get_db()

    if args.lesson:
        lessons = [conn.execute(
            "SELECT * FROM lessons WHERE id = ? AND local_audio_path IS NOT NULL AND audio_downloaded = 1",
            (args.lesson,),
        ).fetchone()]
        lessons = [l for l in lessons if l is not None]
        if not lessons:
            print(f"Lesson {args.lesson} not found or has no local audio")
            conn.close()
            sys.exit(1)
    else:
        lessons = get_lessons_with_audio(conn)

    if args.limit:
        lessons = lessons[: args.limit]

    total_lessons = len(lessons)
    print(f"\nFound {total_lessons} lessons with local audio")

    grand_total = 0
    grand_success = 0
    grand_failed = 0

    for idx, lesson in enumerate(lessons):
        lesson_id = lesson["id"]
        lesson_name = lesson["lesson_name"] or lesson["name"]

        print(f"\n[{idx + 1}/{total_lessons}] Lesson {lesson_id}: {lesson_name}")

        total, succeeded, failed = process_lesson(lesson, conn, args.dry_run, args.verbose)
        grand_total += total
        grand_success += succeeded
        grand_failed += failed

        print(f"  => {succeeded}/{total} clips created, {failed} failed")

    conn.close()

    print(f"\n{'=' * 50}")
    print(f"Done! {grand_success}/{grand_total} clips created, {grand_failed} failed")
    print(f"Output directory: {STORAGE_DIR}")


if __name__ == "__main__":
    main()
