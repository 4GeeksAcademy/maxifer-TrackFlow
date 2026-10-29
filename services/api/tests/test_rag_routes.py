from fastapi.testclient import TestClient

from data.pipelines import rag
from services.api.main import app
from services.api.security import get_current_user


def test_rag_query_requires_authentication():
    response = TestClient(app).post(
        "/api/rag/query", json={"question": "¿Cuál es el SLA estándar?"}
    )

    assert response.status_code == 401


def test_authenticated_rag_query_returns_generated_answer_and_source(monkeypatch):
    monkeypatch.setattr(
        rag,
        "query",
        lambda question: {
            "answer": "El plazo es de 3 a 5 días hábiles.",
            "sources": [{"source_document": "sla-delivery", "section": "SLA de Entrega"}],
            "retrieved_count": 1,
            "abstained": False,
        },
    )
    app.dependency_overrides[get_current_user] = lambda: {"id": "test-user"}
    try:
        response = TestClient(app).post(
            "/api/rag/query", json={"question": "  ¿Cuál es el SLA estándar?  "}
        )
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 200
    assert response.json()["answer"] == "El plazo es de 3 a 5 días hábiles."
    assert response.json()["sources"][0]["source_document"] == "sla-delivery"


def test_rag_query_rejects_blank_question():
    app.dependency_overrides[get_current_user] = lambda: {"id": "test-user"}
    try:
        response = TestClient(app).post("/api/rag/query", json={"question": "   "})
    finally:
        app.dependency_overrides.pop(get_current_user, None)

    assert response.status_code == 400