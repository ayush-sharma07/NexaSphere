import importlib

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def app_client(monkeypatch):
    monkeypatch.setenv("GOOGLE_PROJECT_ID", "test-project")
    monkeypatch.setenv("GOOGLE_SERVICE_ACCOUNT_EMAIL", "test@example.com")
    monkeypatch.setenv("GOOGLE_PRIVATE_KEY", "dummy-private-key")
    monkeypatch.setenv("GOOGLE_SHEET_ID", "test-sheet-id")
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")
    monkeypatch.setenv("FORMS_RATE_LIMIT_MAX", "2")
    monkeypatch.setenv("FORMS_RATE_LIMIT_WINDOW_MS", "60000")
    monkeypatch.setenv("CHAT_RATE_LIMIT_MAX", "2")
    monkeypatch.setenv("CHAT_RATE_LIMIT_WINDOW_MS", "60000")
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    main = importlib.import_module("main")
    importlib.reload(main)

    return TestClient(main.app)


def test_forms_endpoint_rate_limits_after_threshold(app_client, monkeypatch):
    async def noop(*args, **kwargs):
        return None

    import services.sheets as sheets_module
    import services.supabase as supabase_module

    monkeypatch.setattr(sheets_module.sheets_service, "append_membership", noop)
    monkeypatch.setattr(supabase_module.supabase_service, "insert_membership", noop)

    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "whatsapp": "9876543210",
        "year": "1st Year",
        "branch": "CSE",
        "section": "A",
        "reason": "Testing",
    }

    first = app_client.post(
        "/api/forms/membership",
        json=payload,
        headers={"x-forwarded-for": "198.51.100.10"},
    )
    second = app_client.post(
        "/api/forms/membership",
        json=payload,
        headers={"x-forwarded-for": "198.51.100.10"},
    )
    third = app_client.post(
        "/api/forms/membership",
        json=payload,
        headers={"x-forwarded-for": "198.51.100.10"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
    assert third.json()["error"] == "Too many form submissions. Please slow down and try again later."


def test_ai_chat_rate_limits_separately(app_client):
    payload = {"message": "Hello there"}

    first = app_client.post(
        "/ai/chat",
        json=payload,
        headers={"x-forwarded-for": "198.51.100.11"},
    )
    second = app_client.post(
        "/ai/chat",
        json=payload,
        headers={"x-forwarded-for": "198.51.100.11"},
    )
    third = app_client.post(
        "/ai/chat",
        json=payload,
        headers={"x-forwarded-for": "198.51.100.11"},
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 429
    assert third.json()["error"] == "Too many chat requests. Please wait a moment and try again."