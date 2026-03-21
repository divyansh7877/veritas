from ai_sdk import gemini
from app.core.config import settings

MODEL_NAME = "gemini-2.0-flash"


def get_model():
    return gemini(MODEL_NAME, api_key=settings.gemini_api_key)


def is_mock() -> bool:
    return settings.use_mock_llm
