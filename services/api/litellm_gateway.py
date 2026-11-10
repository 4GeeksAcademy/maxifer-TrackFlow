MODEL_ALIAS_PREFIX = "litellm/"


def configure_litellm_proxy() -> None:
    import litellm

    if getattr(litellm, "_trackflow_proxy_configured", False):
        return

    def wrap_call(original):
        def call(*args, **kwargs):
            model = kwargs.get("model")
            if isinstance(model, str):
                kwargs["model"] = model.removeprefix(MODEL_ALIAS_PREFIX)
            elif args and isinstance(args[0], str):
                args = (args[0].removeprefix(MODEL_ALIAS_PREFIX), *args[1:])
            kwargs["custom_llm_provider"] = "openai"
            return original(*args, **kwargs)

        return call

    litellm.embedding = wrap_call(litellm.embedding)
    litellm.completion = wrap_call(litellm.completion)
    litellm._trackflow_proxy_configured = True
