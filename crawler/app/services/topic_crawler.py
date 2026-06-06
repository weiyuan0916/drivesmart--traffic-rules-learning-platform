"""Topic crawler - parses /exercises HTML to extract topic metadata."""
from __future__ import annotations

import logging
import re
from dataclasses import dataclass

from bs4 import BeautifulSoup

from app.api.client import HTTPClient
from app.api import endpoints
from app.db.models import Topic
from app.db.session import get_session

logger = logging.getLogger(__name__)

BASE_URL = "https://dailydictation.com"


@dataclass
class TopicData:
    name: str
    slug: str
    url: str
    lesson_count: int
    levels: str
    description: str


def parse_topics(html: str) -> list[TopicData]:
    """Parse the /exercises page HTML to extract topic data."""
    soup = BeautifulSoup(html, "html.parser")
    topics: list[TopicData] = []

    for card in soup.find_all("div", class_="card"):
        link_el = card.find("a", href=lambda h: h and "/exercises/" in h and h != "/exercises/")
        if not link_el:
            continue

        href = link_el.get("href", "")
        if not href.startswith("/exercises/"):
            continue

        slug = href.strip("/").split("/")[-1]

        h2 = card.find("h2")
        name = h2.get_text(strip=True) if h2 else ""

        level_el = card.find("span", class_="text-muted")
        levels = level_el.get_text(strip=True) if level_el else ""

        count_el = card.find("div", class_="text-muted")
        lesson_count = 0
        if count_el:
            count_text = count_el.get_text(strip=True)
            match = re.search(r"(\d+)\s*lessons?", count_text)
            if match:
                lesson_count = int(match.group(1))

        desc_id_match = re.search(r'course-desc-(\d+)', str(card))
        description = ""
        if desc_id_match:
            desc_el = card.find("div", id=f"course-desc-{desc_id_match.group(1)}")
            if desc_el:
                p = desc_el.find("p")
                description = p.get_text(strip=True) if p else desc_el.get_text(strip=True)

        if slug and name:
            topics.append(
                TopicData(
                    name=name,
                    slug=slug,
                    url=f"{BASE_URL}{href}",
                    lesson_count=lesson_count,
                    levels=levels,
                    description=description,
                )
            )

    if not topics:
        logger.warning("No topics found on /exercises page. HTML structure may have changed.")

    return topics


def save_topics(topics: list[TopicData]) -> list[Topic]:
    """Save topics to database, skipping duplicates."""
    saved: list[Topic] = []
    with get_session() as session:
        for t in topics:
            existing = session.query(Topic).filter_by(slug=t.slug).first()
            if existing:
                existing.lesson_count = t.lesson_count
                existing.levels = t.levels
                existing.description = t.description
                logger.info("Updated topic: %s (%d lessons)", t.name, t.lesson_count)
            else:
                topic = Topic(
                    name=t.name,
                    slug=t.slug,
                    url=t.url,
                    lesson_count=t.lesson_count,
                    levels=t.levels,
                    description=t.description,
                )
                session.add(topic)
                logger.info("Saved topic: %s (%d lessons)", t.name, t.lesson_count)
            session.commit()
            saved.append(existing or session.query(Topic).filter_by(slug=t.slug).first())
    return saved


async def crawl_topics(client: HTTPClient) -> list[Topic]:
    """Main entry point: fetch and save all topics."""
    logger.info("Fetching /exercises page...")
    html = await endpoints.get_topics_page(client)
    topic_data = parse_topics(html)
    logger.info("Found %d topics", len(topic_data))
    return save_topics(topic_data)
