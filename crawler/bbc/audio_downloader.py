"""Audio (MP3) downloader for BBC 6-Minute English episodes.

Streams MP3 files to disk in chunks (BBC episodes are typically 5-10 MB).
Skips download if the file already exists with non-zero size.
"""
from __future__ import annotations

import logging
from pathlib import Path

from crawler.bbc.bbc_client import BBCClient, BBCClientError

logger = logging.getLogger(__name__)


async def download_audio(
    client: BBCClient,
    audio_url: str,
    target: Path,
) -> Path:
    """Stream an MP3 file to disk.

    Args:
        client: Active BBCClient.
        audio_url: Direct URL to the .mp3 file.
        target: Local path to write the MP3.

    Returns:
        The target Path on success.

    Raises:
        BBCClientError: if the download fails after retries.
    """
    target.parent.mkdir(parents=True, exist_ok=True)

    if target.exists() and target.stat().st_size > 0:
        logger.info("Audio already exists, skipping: %s (%d bytes)",
                    target, target.stat().st_size)
        return target

    logger.info("Downloading audio: %s → %s", audio_url, target)
    try:
        bytes_written = 0
        with target.open("wb") as fh:
            async for chunk in client.stream_bytes(audio_url):
                fh.write(chunk)
                bytes_written += len(chunk)
        logger.info("Audio saved: %s (%d bytes)", target, bytes_written)
        return target
    except BBCClientError:
        # Clean up partial file
        if target.exists():
            try:
                target.unlink()
            except OSError:
                pass
        raise


__all__ = ["download_audio"]
