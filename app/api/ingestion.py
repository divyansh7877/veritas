from fastapi import APIRouter, HTTPException, UploadFile, File

from app.core.db import get_supabase
from app.schemas.document import DocumentRead
from app.services import document_service, project_service
from app.agents.ingestion import summarize_document

router = APIRouter(tags=["Ingestion"])

STORAGE_BUCKET = "documents"


@router.post("/projects/{project_id}/ingest", response_model=DocumentRead)
async def ingest_document(project_id: str, file: UploadFile = File(...)):
    project = project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = await file.read()
    storage_path = f"{project_id}/{file.filename}"

    db = get_supabase()
    db.storage.from_(STORAGE_BUCKET).upload(storage_path, content)

    text = content.decode("utf-8", errors="replace")
    summary = summarize_document(text)

    doc = document_service.create_document(project_id, storage_path, summary)
    return doc
