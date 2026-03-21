from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ingestion, tasks

app = FastAPI(title="Veritas", version="0.1.0", description="AI-Powered Requirements Alignment System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingestion.router)
app.include_router(tasks.router)


@app.get("/health")
def health():
    return {"status": "ok"}
