from services.api.litellm_gateway import configure_litellm_proxy


def test_configure_proxy_strips_alias_prefix_and_selects_openai_provider(monkeypatch):
    import litellm

    calls = []

    def fake_call(**kwargs):
        calls.append(kwargs)
        return "ok"

    monkeypatch.setattr(litellm, "embedding", fake_call)
    monkeypatch.setattr(litellm, "completion", fake_call)
    monkeypatch.setattr(litellm, "_trackflow_proxy_configured", False, raising=False)

    configure_litellm_proxy()
    litellm.embedding(model="litellm/online/example/embed", input=["text"], api_base="https://gateway")
    litellm.completion(model="litellm/online/example/chat", messages=[])

    assert calls == [
        {
            "model": "online/example/embed",
            "input": ["text"],
            "api_base": "https://gateway",
            "custom_llm_provider": "openai",
        },
        {
            "model": "online/example/chat",
            "messages": [],
            "custom_llm_provider": "openai",
        },
    ]