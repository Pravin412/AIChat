
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_home_endpoint():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "AIChat backend is running"
    }


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    data = response.json()

    assert data["api_status"] == "running"
    assert data["ollama_status"] in ["available", "unavailable"]


def test_empty_message_is_rejected():
    response = client.post(
        "/api/chat",
        json={"message": "   "}
    )

    assert response.status_code in [400, 422]


def test_missing_message_is_rejected():
    response = client.post("/api/chat", json={})

    assert response.status_code == 422
