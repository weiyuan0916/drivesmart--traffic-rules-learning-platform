"""API endpoint functions for Daily Dictation."""
from app.api.client import HTTPClient

BASE_URL = "https://dailydictation.com"


async def get_topics_page(client: HTTPClient) -> str:
    """Fetch the exercises listing page HTML."""
    return await client.get_text("/exercises")


async def get_topic_sections_page(client: HTTPClient, topic_slug: str) -> str:
    """Fetch a topic's section listing page HTML."""
    return await client.get_text(f"/exercises/{topic_slug}")


async def get_lesson_list_page(client: HTTPClient, page: int = 1) -> dict:
    """Fetch paginated lesson list from the API."""
    return await client.get_json(f"/api/lessons?page={page}")


async def get_lesson_detail(client: HTTPClient, lesson_id: int) -> dict:
    """Fetch full lesson detail from the API."""
    return await client.get_json(f"/api/lessons/{lesson_id}")
