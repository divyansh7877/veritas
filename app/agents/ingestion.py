from ai_sdk import generate_text
from app.agents.base import get_model, is_mock

SUMMARIZE_PROMPT = (
    "You are a document analysis expert. Read the following legacy documentation "
    "and produce a concise summary that captures all key requirements, constraints, "
    "goals, and stakeholder concerns.\n\n"
    "DOCUMENT:\n{document_text}\n\n"
    "Provide a structured summary."
)

MOCK_SUMMARY = (
    "This document outlines a project involving environmental compliance, "
    "engineering specifications for a new facility, and C-Suite strategic goals. "
    "Key areas include emissions targets, structural load requirements, and ROI timelines."
)


def summarize_document(document_text: str) -> str:
    if is_mock():
        return MOCK_SUMMARY

    model = get_model()
    result = generate_text(
        model=model,
        prompt=SUMMARIZE_PROMPT.format(document_text=document_text),
    )
    return result.text
