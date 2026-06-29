"""PDF transcript downloader and text extractor.

Downloads BBC PDF transcripts and extracts clean text via pdfplumber.
Outputs:
- <slug>/transcript.pdf  (raw PDF)
- <slug>/transcript.txt  (cleaned text, UTF-8)
"""
from __future__ import annotations

import io
import logging
import re
from pathlib import Path
from typing import Optional

from crawler.bbc.bbc_client import BBCClient, BBCClientError

logger = logging.getLogger(__name__)

# Patterns to strip from PDF text (BBC-specific boilerplate)
BBC_HEADER_RE = re.compile(r"^BBC Learning English\s*$", re.MULTILINE | re.IGNORECASE)
PAGE_FOOTER_RE = re.compile(r"^Page \d+ of \d+\s*$", re.MULTILINE | re.IGNORECASE)
URL_FOOTER_RE = re.compile(r"bbc\.co\.uk/learningenglish", re.IGNORECASE)
DATE_LINE_RE = re.compile(r"^\s*(BBC Learning English - \d Minute English.*)$", re.MULTILINE)


def clean_pdf_text(raw: str) -> str:
    """Strip BBC PDF headers, page footers, and excess whitespace.

    Args:
        raw: Raw text extracted from the PDF.

    Returns:
        Cleaned UTF-8 text suitable for transcript storage.
    """
    if not raw:
        return ""

    text = raw

    # Remove page headers/footers
    text = BBC_HEADER_RE.sub("", text)
    text = PAGE_FOOTER_RE.sub("", text)
    text = URL_FOOTER_RE.sub("", text)

    # Collapse multiple blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse runs of spaces (but preserve newlines)
    text = re.sub(r"[ \t]+", " ", text)
    # Strip trailing whitespace per line
    text = "\n".join(line.rstrip() for line in text.splitlines())
    # Trim
    text = text.strip()

    return text


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using pdfplumber.

    Returns cleaned text. Empty string on any extraction failure (does not raise).
    """
    if not pdf_bytes:
        return ""
    try:
        import pdfplumber
    except ImportError:
        logger.error("pdfplumber is not installed — run `pip install pdfplumber`")
        return ""

    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                try:
                    pages_text.append(page.extract_text() or "")
                except Exception as exc:  # noqa: BLE001
                    logger.warning("PDF page extraction failed: %s", exc)
                    pages_text.append("")
            raw = "\n\n".join(pages_text)
    except Exception as exc:  # noqa: BLE001
        logger.error("PDF open failed: %s", exc)
        return ""

    return clean_pdf_text(raw)


def save_transcript(text: str, target: Path) -> None:
    """Write cleaned transcript text to disk (UTF-8). Creates parent dirs."""
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(text or "", encoding="utf-8")


async def download_pdf(
    client: BBCClient,
    pdf_url: str,
    target_pdf: Path,
    target_txt: Optional[Path] = None,
) -> tuple[Path, Optional[Path]]:
    """Download a PDF transcript and (optionally) extract text.

    Args:
        client: Active BBCClient.
        pdf_url: Direct URL to the .pdf file.
        target_pdf: Local path to write the raw PDF.
        target_txt: Optional local path to write extracted text.

    Returns:
        (target_pdf, target_txt) — target_txt is None if not requested or extraction failed.
    """
    target_pdf.parent.mkdir(parents=True, exist_ok=True)

    if target_pdf.exists() and target_pdf.stat().st_size > 0:
        logger.info("PDF already exists, skipping download: %s", target_pdf)
        pdf_bytes = target_pdf.read_bytes()
    else:
        logger.info("Downloading PDF: %s → %s", pdf_url, target_pdf)
        try:
            pdf_bytes = await client.get_bytes(pdf_url)
        except BBCClientError as exc:
            logger.error("PDF download failed for %s: %s", pdf_url, exc)
            raise
        target_pdf.write_bytes(pdf_bytes)
        logger.info("PDF saved: %s (%d bytes)", target_pdf, len(pdf_bytes))

    saved_txt: Optional[Path] = None
    if target_txt is not None:
        try:
            text = extract_text_from_pdf_bytes(pdf_bytes)
            save_transcript(text, target_txt)
            saved_txt = target_txt
            logger.info("Transcript text saved: %s (%d chars)", target_txt, len(text))
        except Exception as exc:  # noqa: BLE001
            logger.error("Text extraction failed for %s: %s", target_pdf, exc)

    return target_pdf, saved_txt


__all__ = [
    "clean_pdf_text",
    "extract_text_from_pdf_bytes",
    "save_transcript",
    "download_pdf",
]
