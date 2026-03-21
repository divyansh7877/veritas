from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import projects, stakeholders, ingestion, conversations, orchestration, specs, approvals, changes

app = FastAPI(title="Veritas", version="0.1.0", description="AI-Powered Requirements Alignment System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(stakeholders.router)
app.include_router(ingestion.router)
app.include_router(conversations.router)
app.include_router(orchestration.router)
app.include_router(specs.router)
app.include_router(approvals.router)
app.include_router(changes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
