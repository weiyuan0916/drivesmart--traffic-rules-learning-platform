"""Audio splitter — chops a downloaded MP3 into N-second chunks using pydub.

Optional feature. Triggered by `--split-audio` flag in the CLI.
Requires ffmpeg to be installed on the system (pydub dependency).
"""
from __future__ import annotations

import logging
import shutil
import subprocess
from pathlib import Path

logger = logging.getLogger(__name__)


def ffmpeg_available() -> bool:
    """Check if ffmpeg is on PATH (required by pydub)."""
    return shutil.which("ffmpeg") is not None


def split_audio(
    source: Path,
    output_dir: Path,
    chunk_seconds: int = 30,
) -> list[Path]:
    """Split an MP3 file into fixed-length chunks.

    Args:
        source: Path to input MP3.
        output_dir: Directory to write chunk files (created if absent).
        chunk_seconds: Length of each chunk in seconds.

    Returns:
        List of paths to chunk files (000.mp3, 001.mp3, ...).

    Raises:
        FileNotFoundError: if source doesn't exist.
        RuntimeError: if ffmpeg/pydub is not available or split fails.
    """
    if not source.exists():
        raise FileNotFoundError(f"Audio file not found: {source}")

    if not ffmpeg_available():
        raise RuntimeError(
            "ffmpeg is not installed. Install with `brew install ffmpeg` and retry."
        )

    try:
        from pydub import AudioSegment
        from pydub.utils import mediainfo
    except ImportError as exc:
        raise RuntimeError(
            "pydub is not installed. Run `pip install pydub` and retry."
        ) from exc

    output_dir.mkdir(parents=True, exist_ok=True)

    logger.info("Loading audio: %s", source)
    audio = AudioSegment.from_mp3(source)
    duration_ms = len(audio)
    chunk_ms = chunk_seconds * 1000
    total_chunks = (duration_ms + chunk_ms - 1) // chunk_ms

    logger.info(
        "Splitting %d ms audio into %d chunks of %d s → %s",
        duration_ms, total_chunks, chunk_seconds, output_dir,
    )

    chunks: list[Path] = []
    for i in range(total_chunks):
        start = i * chunk_ms
        end = min(start + chunk_ms, duration_ms)
        chunk = audio[start:end]
        out_path = output_dir / f"{i:03d}.mp3"
        chunk.export(out_path, format="mp3")
        chunks.append(out_path)
        logger.debug("Wrote chunk %d/%d: %s (%d ms)", i + 1, total_chunks, out_path, end - start)

    logger.info("Split complete: %d chunks", len(chunks))
    return chunks


__all__ = ["split_audio", "ffmpeg_available"]
