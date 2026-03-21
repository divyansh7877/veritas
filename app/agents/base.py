from ai_sdk import openai
from app.core.config import settings

GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
MODEL_NAME = "gemini-2.0-flash"


def get_model():
    return openai(
        MODEL_NAME,
        base_url=GEMINI_BASE_URL,
        api_key=settings.gemini_api_key,
    )


def is_mock() -> bool:
    return settings.use_mock_llm
