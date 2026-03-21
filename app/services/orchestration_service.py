from fastapi import HTTPException

from app.services import conversation_service, requirement_service, conflict_service, spec_service
from app.services import source_service, task_service
from app.agents.analyst import extract_requirements, generate_tasks
from app.agents.reviewer import detect_conflicts
from app.agents.writer import generate_spec
from app.agents.ingestion import analyze_codebase, summarize_documentation, parse_suggestions
from app.services.github_service import clone_repo, cleanup_repo


def run_single_pass(task_id: str) -> dict:
    """Run a single-pass analysis on a task (legacy flow)."""
    conversations = conversation_service.get_conversations(task_id)
    if not conversations:
        return {
            "action": "no_conversations",
            "requirements_extracted": 0,
            "conflicts_found": 0,
        }

    transcript_parts = []
    for conv in conversations:
        question = conv.get("question", {})
        answer = conv.get("answer", {})
        if isinstance(question, dict):
            transcript_parts.append(f"Q: {question.get('content', str(question))}")
        if isinstance(answer, dict):
            transcript_parts.append(f"A: {answer.get('content', str(answer))}")

    transcript = "\n".join(transcript_parts)
    requirements = extract_requirements(transcript)

    saved_requirements = []
    for req in requirements:
        result = requirement_service.create_requirement(
            task_id=task_id,
            title=req["title"],
            description=req["description"],
        )
        saved_requirements.append(result)

    conflicts = detect_conflicts(requirements)

    saved_conflicts = []
    for conflict in conflicts:
        requirement_ids = []
        for saved in saved_requirements:
            if saved[0].get("title") in conflict.get("requirement_titles", []):
                requirement_ids.append(saved[0]["id"])
        result = conflict_service.create_conflicts(task_id, [{
            "requirement_ids": requirement_ids,
            "description": conflict["description"],
        }])
        saved_conflicts.append(result)

    spec_content = generate_spec(requirements, conflicts)
    spec = spec_service.create_spec_version(task_id, spec_content)

    return {
        "action": "completed",
        "requirements_extracted": len(requirements),
        "conflicts_found": len(conflicts),
        "spec_version_id": spec[0]["id"] if spec else None,
        "spec_content": spec_content,
    }


def run_ingestion_pipeline(project_id: str | None = None) -> dict:
    """Ingest sources (GitHub, docs, suggestions), analyze, and generate tasks."""
    repo_sources = source_service.get_sources(project_id, "github_repo")
    doc_sources = source_service.get_sources(project_id, "documentation")
    suggestion_sources = source_service.get_sources(project_id, "suggestion")

    if not repo_sources and not doc_sources and not suggestion_sources:
        raise HTTPException(status_code=400, detail="No sources ingested yet")

    codebase_analysis: dict = {}
    for repo in repo_sources:
        repo_url = repo["name"]
        branch = (repo.get("metadata") or {}).get("branch", "main")
        try:
            repo_path = clone_repo(repo_url, branch)
        except RuntimeError as e:
            raise HTTPException(status_code=400, detail=str(e))
        try:
            codebase_analysis = analyze_codebase(repo_path)
        finally:
            cleanup_repo(repo_path)

    doc_texts = [s["content"] for s in doc_sources if s.get("content")]
    doc_summary = summarize_documentation(doc_texts) if doc_texts else ""

    all_suggestions: list[dict] = []
    for s in suggestion_sources:
        if s.get("content"):
            all_suggestions.extend(parse_suggestions([s["content"]]))

    tasks = generate_tasks(codebase_analysis, doc_summary, all_suggestions)

    created_tasks = []
    if tasks:
        created_tasks = task_service.create_tasks(project_id, tasks)

    return {
        "tasks_created": len(created_tasks),
        "tasks": created_tasks,
        "codebase_analyzed": bool(repo_sources),
        "docs_summarized": len(doc_texts),
        "suggestions_parsed": len(all_suggestions),
    }
