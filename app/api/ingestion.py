from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services import source_service
from app.services.orchestration_service import run_ingestion_pipeline

router = APIRouter(prefix="/ingestion", tags=["Ingestion"])


class GitHubSourceCreate(BaseModel):
    repo_url: str
    branch: str = "main"


class SuggestionSourceCreate(BaseModel):
    prompts: list[str]


@router.post("/sources/github")
async def ingest_github_repo(data: GitHubSourceCreate, project_id: str | None = None):
    source = source_service.create_source(
        project_id=project_id,
        source_type="github_repo",
        name=data.repo_url,
        metadata={"branch": data.branch},
    )
    return source


@router.post("/sources/docs")
async def ingest_documentation(files: list[UploadFile] = File(...), project_id: str | None = None):
    created: list[dict] = []
    for f in files:
        content = await f.read()
        text = content.decode("utf-8", errors="replace")
        source = source_service.create_source(
            project_id=project_id,
            source_type="documentation",
            name=f.filename or "untitled.md",
            content=text,
        )
        created.append(source)
    return created


@router.post("/sources/suggestions")
async def ingest_suggestions(data: SuggestionSourceCreate, project_id: str | None = None):
    created: list[dict] = []
    for i, prompt in enumerate(data.prompts):
        if not prompt.strip():
            continue
        source = source_service.create_source(
            project_id=project_id,
            source_type="suggestion",
            name=f"Suggestion {i + 1}",
            content=prompt.strip(),
        )
        created.append(source)
    return created


@router.get("/sources")
def list_sources(project_id: str | None = None, source_type: str | None = None):
    return source_service.get_sources(project_id, source_type)


@router.post("/analyze")
async def analyze_project(project_id: str | None = None):
    return run_ingestion_pipeline(project_id)
