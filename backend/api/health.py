import httpx
from fastapi import APIRouter


router = APIRouter()


@router.get("/health")
def health():
    """Check the API and local Ollama service."""

    ollama_status = "available"

    try:
        response = httpx.get(
            "http://localhost:11434/api/tags",
            timeout=3.0,
        )
        response.raise_for_status()

    except (httpx.HTTPError, httpx.TimeoutException):
        ollama_status = "unavailable"

    return {
        "api_status": "running",
        "ollama_status": ollama_status,
    }