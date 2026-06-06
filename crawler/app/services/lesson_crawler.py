"""Lesson crawler - fetches lesson list and detail from the API."""
from __future__ import annotations

import asyncio
import json
import logging
from dataclasses import dataclass

from app.api.client import HTTPClient
from app.api import endpoints
from app.db.models import Challenge, Lesson, Section
from app.db.session import get_session

logger = logging.getLogger(__name__)


@dataclass
class LessonListItem:
    id: int
    name: str
    total_challenges: int


@dataclass
class LessonDetail:
    id: int
    lesson_name: str
    name: str
    position: int
    level_name: str
    audio_src: str
    challenges: list[dict]


@dataclass
class ChallengeData:
    lesson_id: int
    position: int
    content: str
    solution: str
    audio_src: str
    time_start: str
    time_end: str
    hints: str
    nb_comments: int
    discussion_url: str


def _extract_level_from_section(section_slug: str) -> str:
    """Extract vocab level from section slug if available."""
    return ""


def save_lesson_list(lessons: list[LessonListItem]) -> list[int]:
    """Save or update lesson list items. Returns list of lesson IDs."""
    saved_ids: list[int] = []
    with get_session() as session:
        for item in lessons:
            existing = session.query(Lesson).filter_by(id=item.id).first()
            if existing:
                existing.name = item.name
                existing.parts_count = item.total_challenges
            else:
                lesson = Lesson(
                    id=item.id,
                    name=item.name,
                    lesson_url=f"https://dailydictation.com/api/lessons/{item.id}",
                    parts_count=item.total_challenges,
                )
                session.add(lesson)
            session.commit()
            saved_ids.append(item.id)
    return saved_ids


def save_lesson_detail(detail: LessonDetail) -> Lesson:
    """Save full lesson detail including challenges."""
    with get_session() as session:
        lesson = session.query(Lesson).filter_by(id=detail.id).first()
        if not lesson:
            lesson = Lesson(
                id=detail.id,
                name=detail.lesson_name or detail.name,
                lesson_url=f"https://dailydictation.com/api/lessons/{detail.id}",
                parts_count=len(detail.challenges),
            )
            session.add(lesson)
            session.commit()
        else:
            lesson.lesson_name = detail.lesson_name
            lesson.name = detail.name
            lesson.audio_src = detail.audio_src
            lesson.vocab_level = detail.level_name
            lesson.parts_count = len(detail.challenges)
            # Build full transcript from challenge content
            transcript_text = " ".join(ch.get("content", "") for ch in detail.challenges if ch.get("content"))
            lesson.transcript = transcript_text
            existing_challenge_ids = {c.position for c in lesson.challenges}
            for ch_data in detail.challenges:
                position = ch_data.get("position", 0)
                if position in existing_challenge_ids:
                    continue
                challenge = Challenge(
                    lesson_id=detail.id,
                    position=position,
                    content=ch_data.get("content", ""),
                    solution=json.dumps(ch_data.get("solution", [])),
                    audio_src=ch_data.get("audioSrc", ""),
                    time_start=str(ch_data.get("timeStart", "")),
                    time_end=str(ch_data.get("timeEnd", "")),
                    hints=json.dumps(ch_data.get("hints", [])),
                    nb_comments=ch_data.get("nbComments", 0),
                    discussion_url=ch_data.get("discussionUrl", ""),
                )
                session.add(challenge)
            session.commit()
            session.refresh(lesson)
        return lesson


async def fetch_lesson_detail(client: HTTPClient, lesson_id: int) -> LessonDetail | None:
    """Fetch and save full lesson detail."""
    try:
        data = await endpoints.get_lesson_detail(client, lesson_id)
        detail = LessonDetail(
            id=data["id"],
            lesson_name=data.get("lessonName", ""),
            name=data.get("name", ""),
            position=data.get("position", 0),
            level_name=data.get("levelName", ""),
            audio_src=data.get("audioSrc", ""),
            challenges=data.get("challenges", []),
        )
        return save_lesson_detail(detail)
    except Exception as e:
        logger.error("Failed to fetch lesson detail for id=%d: %s", lesson_id, e)
        return None


async def crawl_all_lessons(client: HTTPClient, max_concurrency: int = 10) -> list[int]:
    """
    Crawl all lessons by paginating through the global lesson list API.
    The `section` param is broken on the API (returns all lessons regardless),
    so we paginate through all 70 pages and deduplicate by ID.
    """
    logger.info("Starting lesson list crawl (paginating through all pages)...")

    seen_ids: set[int] = set()
    page = 1

    while True:
        data = await endpoints.get_lesson_list_page(client, page=page)
        items = data.get("lessons", [])
        nb_pages = data.get("nbPages", 1)

        if not items:
            break

        lessons = [
            LessonListItem(id=item["id"], name=item["name"], total_challenges=item.get("totalChallenges", 0))
            for item in items
        ]

        new_ids = [l.id for l in lessons if l.id not in seen_ids]
        if new_ids:
            save_lesson_list(lessons)
            seen_ids.update(new_ids)
            logger.info("Page %d/%d: saved %d lessons (total unique: %d)", page, nb_pages, len(lessons), len(seen_ids))

        if page >= nb_pages:
            break
        page += 1

    logger.info("Lesson list crawl complete. Total unique lessons: %d", len(seen_ids))
    return list(seen_ids)


async def crawl_lesson_details(
    client: HTTPClient,
    lesson_ids: list[int],
    max_concurrency: int = 10,
) -> list[Lesson]:
    """Fetch full detail for each lesson ID with concurrency control."""
    semaphore = asyncio.Semaphore(max_concurrency)

    async def fetch_with_semaphore(lid: int) -> Lesson | None:
        async with semaphore:
            return await fetch_lesson_detail(client, lid)

    logger.info("Fetching full detail for %d lessons (concurrency=%d)...", len(lesson_ids), max_concurrency)
    results = await asyncio.gather(*[fetch_with_semaphore(lid) for lid in lesson_ids], return_exceptions=True)

    lessons: list[Lesson] = []
    for result in results:
        if isinstance(result, Exception):
            logger.error("Lesson detail fetch error: %s", result)
        elif result is not None:
            lessons.append(result)

    logger.info("Lesson details fetched: %d/%d", len(lessons), len(lesson_ids))
    return lessons


async def crawl_lesson_ids_from_section_pages(client: HTTPClient, section_slugs: list[str]) -> list[int]:
    """
    Alternative: Try to get lesson IDs from section pages by parsing HTML links.
    Since the API's `section` param is broken, this is used as a fallback
    to get topic-specific lesson IDs from the DOM.
    """
    seen_ids: set[int] = set()
    for slug in section_slugs:
        html = await endpoints.get_topic_sections_page(client, slug)
        import re
        ids = re.findall(r'/exercises/[^"\']+?/(\d+)-', html)
        for sid in ids:
            seen_ids.add(int(sid))
        logger.info("Found %d lesson IDs from section page: %s", len(ids), slug)
    return list(seen_ids)
