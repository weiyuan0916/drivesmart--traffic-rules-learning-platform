"""Section crawler - parses topic pages HTML to extract section and lesson metadata."""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from bs4 import BeautifulSoup

from app.api.client import HTTPClient
from app.api import endpoints
from app.db.models import Lesson, Section, Topic
from app.db.session import get_session

logger = logging.getLogger(__name__)


@dataclass
class SectionData:
    topic_id: int
    name: str
    slug: str
    order_index: int
    lesson_count: int
    vocab_level: str


def parse_sections(html: str, topic_id: int, topic_slug: str) -> list[SectionData]:
    """
    Parse a topic page HTML to extract section data.
    Layout for Short Stories / Conversations: <h2>Section N</h2> -> <div class="accordion-collapse"> -> lesson links
    """
    soup = BeautifulSoup(html, "html.parser")
    h2_tags = soup.find_all("h2")
    sections: list[SectionData] = []

    for h2 in h2_tags:
        h2_text = h2.get_text(strip=True)
        # Extract order/index: first number in the h2 text.
        # Handles: "Section 1(20 lessons)", "Practice Test 1(20 lessons)", "Cam 20 (2025)(16 lessons)"
        match = re.search(r"([\d]+)", h2_text)
        if not match:
            continue

        order_index = int(match.group(1))

        count_match = re.search(r"\((\d+)\s*lessons?\)", h2_text)
        lesson_count = int(count_match.group(1)) if count_match else 0

        accordion = h2.find_next_sibling("div", class_="accordion-collapse")
        if not accordion:
            continue

        slug = accordion.get("id", "")

        first_lesson_link = accordion.find("a", href=lambda h: h and f"/exercises/{topic_slug}/" in h)
        vocab_level = ""
        if first_lesson_link:
            parent = first_lesson_link.find_parent("div", class_="bg-body-tertiary")
            if parent:
                vocab_el = parent.find("small", string=lambda t: t and "Vocab level:" in t)
                if vocab_el:
                    vocab_level = vocab_el.get_text(strip=True).replace("Vocab level:", "").strip()

        sections.append(
            SectionData(
                topic_id=topic_id,
                name=h2_text,
                slug=slug,
                order_index=order_index,
                lesson_count=lesson_count,
                vocab_level=vocab_level,
            )
        )

    if not sections:
        logger.warning("No sections found on topic page (topic_id=%d). HTML structure may have changed.", topic_id)

    return sections


def _extract_lesson_ids_from_html(html: str, topic_slug: str) -> list[int]:
    """
    Extract lesson IDs from lesson links in a topic page HTML.

    The lesson ID is the LAST numeric component in the slug segment (parts[-2]).
    This handles all URL patterns across topics:
    - Short Stories:   /exercises/short-stories/1-first-snowfall.1/listen-and-type
    - IELTS/TOEFL:     /exercises/ielts-listening/cam20-test-1-part-1.2224/listen-and-type
    - IPA:             /exercises/english-pronunciation/i-vs-ee-it-vs-eat.684/listen-and-select
    """
    soup = BeautifulSoup(html, "html.parser")
    ids: list[int] = []
    for a in soup.find_all("a", href=True):
        href = a.get("href", "")
        if f"/exercises/{topic_slug}/" not in href:
            continue
        parts = href.strip("/").split("/")
        if len(parts) < 2:
            continue
        slug_part = parts[-2]
        numbers = re.findall(r"(\d+)", slug_part)
        if numbers:
            ids.append(int(numbers[-1]))
    return ids


def map_lessons_to_sections(html: str, section_slug: str, section_id: int, topic_slug: str) -> int:
    """
    Find the section accordion div by slug and link all lesson IDs inside to the given section_id.
    Returns count of lessons updated.
    """
    soup = BeautifulSoup(html, "html.parser")
    accordion = soup.find("div", id=section_slug)
    if not accordion:
        return 0

    ids = _extract_lesson_ids_from_html(str(accordion), topic_slug)
    if not ids:
        return 0

    updated = 0
    with get_session() as session:
        for lid in ids:
            row = session.query(Lesson).filter_by(id=lid).first()
            if row and (row.section_id is None or row.section_id != section_id):
                row.section_id = section_id
                updated += 1
        session.commit()
    return updated


def map_lessons_to_topic(html: str, topic_slug: str, topic_id: int) -> int:
    """
    For topics that have no accordion sections, extract all lesson links from the
    page HTML and link them to a synthetic 'Uncategorized' section for that topic.
    Returns count of lessons updated.
    """
    lesson_ids = _extract_lesson_ids_from_html(html, topic_slug)
    if not lesson_ids:
        return 0

    updated = 0
    with get_session() as session:
        unc_slug = f"{topic_slug}_uncategorized"
        existing = session.query(Section).filter_by(topic_id=topic_id, slug=unc_slug).first()
        if existing:
            section_id = existing.id
        else:
            sec = Section(
                topic_id=topic_id,
                name="Uncategorized",
                slug=unc_slug,
                order_index=0,
                lesson_count=len(lesson_ids),
                vocab_level="",
            )
            session.add(sec)
            session.commit()
            section_id = sec.id
            logger.info("Created synthetic section '%s' for topic_id=%d (%d lessons)", unc_slug, topic_id, len(lesson_ids))

        for lid in lesson_ids:
            row = session.query(Lesson).filter_by(id=lid).first()
            if row and (row.section_id is None or row.section_id != section_id):
                row.section_id = section_id
                updated += 1
        session.commit()
    return updated


def save_sections(sections: list[SectionData]) -> list[tuple]:
    """Save sections to DB. Returns list of (section_id, slug) tuples."""
    saved: list[tuple] = []
    with get_session() as session:
        for s in sections:
            existing = session.query(Section).filter_by(topic_id=s.topic_id, slug=s.slug).first()
            if existing:
                existing.lesson_count = s.lesson_count
                existing.vocab_level = s.vocab_level
                existing.order_index = s.order_index
            else:
                section = Section(
                    topic_id=s.topic_id,
                    name=s.name,
                    slug=s.slug,
                    order_index=s.order_index,
                    lesson_count=s.lesson_count,
                    vocab_level=s.vocab_level,
                )
                session.add(section)
            session.commit()
            db_sec = existing or session.query(Section).filter_by(topic_id=s.topic_id, slug=s.slug).first()
            saved.append((db_sec.id, db_sec.slug))
    return saved


async def crawl_sections_for_topic(client: HTTPClient, topic: Topic) -> tuple[list, int]:
    """
    Crawl sections for a single topic.
    Returns (list of (section_id, slug), total_lesson_links_updated).
    - Topics with accordion sections: parse sections and link lessons per accordion
    - Topics without sections: create synthetic 'Uncategorized' section and link all lessons
    """
    logger.info("Fetching sections for topic: %s (slug=%s)", topic.name, topic.slug)
    html = await endpoints.get_topic_sections_page(client, topic.slug)
    section_data = parse_sections(html, topic.id, topic.slug)

    updated = 0
    if section_data:
        # Normal topics: save sections then map lessons to each accordion
        logger.info("Found %d sections for topic %s", len(section_data), topic.slug)
        saved = save_sections(section_data)
        for (sec_id, sec_slug) in saved:
            n = map_lessons_to_sections(html, sec_slug, sec_id, topic.slug)
            updated += n
    else:
        # Topics without sections: link all lesson links to a synthetic section
        logger.info("No accordion sections for topic %s. Falling back to direct lesson mapping.", topic.slug)
        updated = map_lessons_to_topic(html, topic.slug, topic.id)

    logger.info("Linked %d lessons to sections for topic %s", updated, topic.slug)
    return [], updated


async def relink_all_lessons(client: HTTPClient) -> int:
    """
    Re-link all lessons to their sections after the lesson API has populated lesson IDs.
    This is needed because Step 2 (sections) runs before Step 3 (lesson IDs),
    so lesson IDs don't exist in DB yet when section mapping first runs.

    IMPORTANT: Each topic's HTML must be parsed fresh (BeautifulSoup mutates the tree
    via find_next_sibling, consuming elements after each call).
    """
    with get_session() as session:
        topic_rows = session.query(Topic.id, Topic.slug).all()
    total_linked = 0
    for (topic_id, topic_slug) in topic_rows:
        html = await endpoints.get_topic_sections_page(client, topic_slug)
        section_data = parse_sections(html, topic_id, topic_slug)
        if section_data:
            saved = save_sections(section_data)
            for (sec_id, sec_slug) in saved:
                n = map_lessons_to_sections(html, sec_slug, sec_id, topic_slug)
                total_linked += n
        else:
            n = map_lessons_to_topic(html, topic_slug, topic_id)
            total_linked += n
    return total_linked


async def crawl_all_sections(client: HTTPClient) -> list:
    """Crawl sections for all topics."""
    with get_session() as session:
        topics = session.query(Topic).all()

    all_sections: list = []
    for topic in topics:
        saved, _ = await crawl_sections_for_topic(client, topic)
        all_sections.extend(saved)

    return all_sections
