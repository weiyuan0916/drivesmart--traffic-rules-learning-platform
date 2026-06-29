"""Write a human-readable content.md for each crawled episode.

Format:

    # <title>

    **Episode code:** ep-251225
    **Published:** 2025-12-25
    **Level:** intermediate
    **Programme ID:** p0mm9kc1
    **Iframe:** https://www.bbc.co.uk/programmes/p0mm9kc1/player
    **Source:** https://www.bbc.co.uk/learningenglish/.../ep-251225

    ## Description
    ...

    ## Introduction
    ...

    ## Quiz
    ...

    ## Vocabulary
    | Word | Meaning |
    | --- | --- |
    | nostalgia | ... |

    ## Transcript
    ...
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Optional

from crawler.bbc.episode_parser import EpisodeData


def _format_question(question: Optional[Dict[str, Any]]) -> List[str]:
    if not question:
        return []
    lines: List[str] = ["## Quiz", ""]
    prompt = question.get("prompt")
    if prompt:
        lines.append(prompt)
        lines.append("")
    options = question.get("options") or []
    if options:
        for opt in options:
            lines.append(f"- {opt.get('letter')}) {opt.get('text')}")
        lines.append("")
    listen = question.get("answer_listen_for")
    if listen:
        lines.append(f"_{listen}_")
        lines.append("")
    return lines


def _format_vocabulary(vocabulary: List[Dict[str, Any]]) -> List[str]:
    if not vocabulary:
        return []
    lines: List[str] = ["## Vocabulary", ""]
    lines.append("| # | Word | Meaning |")
    lines.append("| --- | --- | --- |")
    for entry in vocabulary:
        word = (entry.get("word") or "").replace("|", "\\|")
        meaning = (entry.get("meaning") or "").replace("|", "\\|").replace("\n", " ")
        lines.append(f"| {entry.get('position', 0) + 1} | {word} | {meaning} |")
    lines.append("")
    return lines


def render_content_md(data: EpisodeData) -> str:
    """Render a markdown body for the episode."""
    parts: List[str] = []

    # Title
    title = data.title or "Untitled episode"
    parts.append(f"# {title}")
    parts.append("")

    # Metadata block
    meta_rows: List[tuple] = []
    if data.episode_code:
        meta_rows.append(("Episode code", data.episode_code))
    if data.published_at:
        meta_rows.append(("Published", data.published_at))
    if data.level:
        meta_rows.append(("Level", data.level))
    if data.bbc_programme_id:
        meta_rows.append(("Programme ID", data.bbc_programme_id))
    if data.iframe_url:
        meta_rows.append(("Iframe", data.iframe_url))
    if data.audio_url:
        meta_rows.append(("Audio", data.audio_url))
    if data.pdf_url:
        meta_rows.append(("Worksheet PDF", data.pdf_url))
    if data.source_url:
        meta_rows.append(("Source", data.source_url))

    if meta_rows:
        for label, value in meta_rows:
            parts.append(f"**{label}:** {value}")
        parts.append("")

    # Description
    if data.description:
        parts.append("## Description")
        parts.append("")
        parts.append(data.description)
        parts.append("")

    # Iframe embed (HTML)
    if data.iframe_url:
        parts.append("## Video")
        parts.append("")
        parts.append(
            f'<iframe width="400" height="500" frameborder="0" '
            f'src="{data.iframe_url}"></iframe>'
        )
        parts.append("")

    # Introduction
    if data.introduction:
        parts.append("## Introduction")
        parts.append("")
        parts.append(data.introduction)
        parts.append("")

    # Quiz
    parts.extend(_format_question(data.question))

    # Vocabulary
    parts.extend(_format_vocabulary(data.vocabulary))

    # Transcript
    if data.transcript:
        parts.append("## Transcript")
        parts.append("")
        parts.append(data.transcript)
        parts.append("")

    return "\n".join(parts).rstrip() + "\n"


def write_content_md(folder: Path, data: EpisodeData) -> Path:
    """Render and write content.md inside ``folder``. Returns the path."""
    folder.mkdir(parents=True, exist_ok=True)
    body = render_content_md(data)
    out = folder / "content.md"
    out.write_text(body, encoding="utf-8")
    return out


__all__ = ["render_content_md", "write_content_md"]
